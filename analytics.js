document.addEventListener('DOMContentLoaded', () => {

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ========================================================
     1. SHARED SIDEBAR LOGOUT CONTROL
     ======================================================== */
  const btnLogoutSidebar = document.getElementById('btn-logout-sidebar');
  if (btnLogoutSidebar) {
    btnLogoutSidebar.addEventListener('click', () => {
      fetch('api.php?action=logout', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            sessionStorage.clear();
            window.location.href = 'index.php';
          }
        })
        .catch(err => {
          window.location.href = 'index.php'; // fallback redirect
          console.error(err);
        });
    });
  }

  /* ========================================================
     2. RENDER DETAILED CHARTS
     ======================================================== */
  let assetsList = [];
  let storageList = [];
  let programChartInstance = null;
  let statusChartInstance = null;
  let availabilityChartInstance = null;
  let availableShareChartInstance = null;

  function loadAnalyticsData() {
    Promise.all([
      fetch('api.php?action=fetch').then(res => res.json()).catch(() => ({ success: false, data: [] })),
      fetch('api.php?action=storage').then(res => res.json()).catch(() => ({ success: false, data: [] }))
    ])
    .then(([assetsRes, storageRes]) => {
      if (assetsRes && assetsRes.success) {
        assetsList = (assetsRes.data || []).map(asset => ({
          ...asset,
          Program: asset.Program ?? asset.program,
          Current_Status: asset.Current_Status ?? asset.current_status,
          CPU_Model: asset.CPU_Model ?? asset.cpu_model,
          CPU_Brand: asset.CPU_Brand ?? asset.cpu_brand,
          CPU_Serial: asset.CPU_Serial ?? asset.cpu_serial,
          Monitor1_Model: asset.Monitor1_Model ?? asset.monitor1_model,
          Monitor1_Serial: asset.Monitor1_Serial ?? asset.monitor1_serial,
          Monitor2_Model: asset.Monitor2_Model ?? asset.monitor2_model,
          Monitor2_Serial: asset.Monitor2_Serial ?? asset.monitor2_serial,
          Monitor3_Model: asset.Monitor3_Model ?? asset.monitor3_model,
          Monitor3_Serial: asset.Monitor3_Serial ?? asset.monitor3_serial
        }));
        assetsList.forEach(a => {
          if (a.Current_Status === 'Deployed') {
            a.Current_Status = 'Onsite Deployed';
          }
        });
      }

      if (storageRes && storageRes.success) {
        storageList = storageRes.data || [];
      }

      // 1. Compute Hardware Statistics (CPUs, Monitors, Storage availability)
      const hardwareStats = computeHardwareStats();

      // 2. Update KPI Tiles
      updateKpiCards(hardwareStats);

      // 3. Render Hardware Availability Charts & Matrix
      renderAvailabilityChart(hardwareStats);
      renderAvailableShareChart(hardwareStats);
      renderAvailabilityTable(hardwareStats);

      // 4. Render Existing Charts & Summary
      renderProgramShareChart();
      renderProgramCountTable();
      renderStatusBreakdownChart();
      populateSummaryMatrix();

      if (window.lucide) {
        lucide.createIcons();
      }
    })
    .catch(err => {
      console.error("Reports failure: ", err);
    });

    function renderProgramCountTable() {
      const summaryBody = document.getElementById('analytics-program-count-body');
      if (!summaryBody) return;

      const programCounts = {};
      assetsList.forEach(asset => {
        const program = (asset.Program || '').toString().trim() || 'Unassigned';
        programCounts[program] = (programCounts[program] || 0) + 1;
      });

      const programs = Object.keys(programCounts).sort((a, b) => {
        if (a === 'Unassigned') return 1;
        if (b === 'Unassigned') return -1;
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
      });
      const total = assetsList.length;

      if (!programs.length) {
        summaryBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--color-text-muted);">No asset records found in database.</td></tr>';
        return;
      }

      summaryBody.innerHTML = programs.map(program => {
        const count = programCounts[program];
        const percentage = total ? ((count / total) * 100).toFixed(1) : '0.0';
        return `
          <tr>
            <td style="padding: 10px 14px; font-weight: 600;">${escapeHtml(program)}</td>
            <td style="padding: 10px 14px;">${count}</td>
            <td style="padding: 10px 14px;">${percentage}%</td>
          </tr>
        `;
      }).join('');
    }
  }

  function computeHardwareStats() {
    let availCpu = 0;
    let defectiveCpu = 0;
    let availMon = 0;
    let defectiveMon = 0;
    let otherAvail = 0;
    let otherDefective = 0;

    // Tally storage inventory items ONLY (storage room stock, excluding wall-to-wall grid)
    storageList.forEach(item => {
      const type = (item.asset_type || '').toLowerCase();
      const status = (item.status || 'In Storage').toLowerCase();
      const qty = parseInt(item.quantity, 10) || 1;
      const isDefective = status === 'defective' || status === 'for repair' || status === 'disposal';

      if (type.includes('cpu')) {
        if (isDefective) defectiveCpu += qty;
        else availCpu += qty;
      } else if (type.includes('monitor')) {
        if (isDefective) defectiveMon += qty;
        else availMon += qty;
      } else {
        if (isDefective) otherDefective += qty;
        else otherAvail += qty;
      }
    });

    const totalCpu = availCpu + defectiveCpu;
    const totalMon = availMon + defectiveMon;
    const totalOther = otherAvail + otherDefective;
    const totalStorage = totalCpu + totalMon + totalOther;
    const totalDefective = defectiveCpu + defectiveMon + otherDefective;

    return {
      availCpu,
      defectiveCpu,
      totalCpu,

      availMon,
      defectiveMon,
      totalMon,

      otherAvail,
      otherDefective,
      totalOther,

      totalStorage,
      totalDefective
    };
  }

  function updateKpiCards(stats) {
    const elAvailCpu = document.getElementById('kpi-available-cpu');
    const elAvailMon = document.getElementById('kpi-available-monitor');
    const elTotalStorage = document.getElementById('kpi-total-storage');
    const elDefective = document.getElementById('kpi-defective-assets');

    if (elAvailCpu) elAvailCpu.textContent = stats.availCpu;
    if (elAvailMon) elAvailMon.textContent = stats.availMon;
    if (elTotalStorage) elTotalStorage.textContent = stats.totalStorage;
    if (elDefective) elDefective.textContent = stats.totalDefective;
  }

  function renderAvailabilityChart(stats) {
    const canvasEl = document.getElementById('analytics-availability-chart');
    if (!canvasEl) return;

    if (availabilityChartInstance) {
      availabilityChartInstance.destroy();
    }

    const labels = ['CPUs', 'Monitors'];
    const availableData = [stats.availCpu, stats.availMon];
    const defectiveData = [stats.defectiveCpu, stats.defectiveMon];

    if (stats.totalOther > 0) {
      labels.push('Other Hardware');
      availableData.push(stats.otherAvail);
      defectiveData.push(stats.otherDefective);
    }

    const ctx = canvasEl.getContext('2d');
    if (window.Chart) {
      availabilityChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Available in Storage (Ready to Deploy)',
              data: availableData,
              backgroundColor: 'rgba(16, 185, 129, 0.85)', // Emerald Green
              borderColor: '#10B981',
              borderWidth: 1.5,
              borderRadius: 4,
              hoverBackgroundColor: '#059669'
            },
            {
              label: 'Defective / Under Repair',
              data: defectiveData,
              backgroundColor: 'rgba(239, 68, 68, 0.85)', // Red
              borderColor: '#EF4444',
              borderWidth: 1.5,
              borderRadius: 4,
              hoverBackgroundColor: '#DC2626'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { family: "'Segoe UI', sans-serif", size: 11, weight: '600' },
                color: '#333333',
                padding: 12,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 59, 92, 0.95)',
              titleFont: { family: "'Segoe UI', sans-serif", size: 12, weight: 'bold' },
              bodyFont: { family: "'Segoe UI', sans-serif", size: 11 },
              padding: 10,
              cornerRadius: 4,
              callbacks: {
                label: function (context) {
                  return ` ${context.dataset.label}: ${context.raw} units`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#E5E7EB' },
              ticks: {
                stepSize: 1,
                font: { family: "'Segoe UI', sans-serif", size: 11 },
                color: '#666666'
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                font: { family: "'Segoe UI', sans-serif", size: 12, weight: '700' },
                color: '#003D5B'
              }
            }
          }
        }
      });
    }
  }

  function renderAvailableShareChart(stats) {
    const canvasEl = document.getElementById('analytics-available-share-chart');
    if (!canvasEl) return;

    if (availableShareChartInstance) {
      availableShareChartInstance.destroy();
    }

    const labels = ['Available CPUs', 'Available Monitors'];
    const data = [stats.availCpu, stats.availMon];
    const colors = ['#10B981', '#25E2CC'];

    if (stats.otherAvail > 0) {
      labels.push('Other Available');
      data.push(stats.otherAvail);
      colors.push('#00A699');
    }

    const totalAvailable = stats.availCpu + stats.availMon + stats.otherAvail;

    const ctx = canvasEl.getContext('2d');
    if (window.Chart) {
      availableShareChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: totalAvailable === 0 ? [1] : data,
            backgroundColor: totalAvailable === 0 ? ['#E5E7EB'] : colors,
            borderColor: '#FFFFFF',
            borderWidth: 2,
            hoverOffset: totalAvailable === 0 ? 0 : 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { family: "'Segoe UI', sans-serif", size: 11, weight: '600' },
                color: '#333333',
                padding: 12,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 59, 92, 0.95)',
              titleFont: { family: "'Segoe UI', sans-serif", size: 12, weight: 'bold' },
              bodyFont: { family: "'Segoe UI', sans-serif", size: 11 },
              padding: 10,
              cornerRadius: 4,
              callbacks: {
                label: function (context) {
                  if (totalAvailable === 0) {
                    return ' No available spare assets in storage';
                  }
                  const val = context.raw;
                  const pct = totalAvailable ? ((val / totalAvailable) * 100).toFixed(1) : '0.0';
                  return ` ${context.label}: ${val} units (${pct}%)`;
                }
              }
            }
          },
          cutout: '58%'
        }
      });
    }
  }

  function renderAvailabilityTable(stats) {
    const tableBody = document.getElementById('analytics-availability-table-body');
    if (!tableBody) return;

    const rows = [
      {
        name: 'CPUs (Processors / Units)',
        avail: stats.availCpu,
        defective: stats.defectiveCpu,
        total: stats.totalCpu
      },
      {
        name: 'Monitors (Display Screens)',
        avail: stats.availMon,
        defective: stats.defectiveMon,
        total: stats.totalMon
      }
    ];

    if (stats.totalOther > 0) {
      rows.push({
        name: 'Other Components / Peripherals',
        avail: stats.otherAvail,
        defective: stats.otherDefective,
        total: stats.totalOther
      });
    }

    tableBody.innerHTML = rows.map(r => {
      const availPct = r.total > 0 ? ((r.avail / r.total) * 100).toFixed(1) : '0.0';
      const healthColor = parseFloat(availPct) >= 50 ? '#059669' : (parseFloat(availPct) > 0 ? '#D97706' : '#DC2626');

      return `
        <tr>
          <td style="padding: 10px 14px; font-weight: 700; color: #003D5B;">${escapeHtml(r.name)}</td>
          <td style="padding: 10px 14px;">
            <span style="display: inline-block; padding: 3px 10px; background: rgba(16, 185, 129, 0.15); color: #059669; font-weight: 700; border-radius: 999px;">
              ${r.avail} available
            </span>
          </td>
          <td style="padding: 10px 14px;">
            <span style="display: inline-block; padding: 3px 10px; background: rgba(239, 68, 68, 0.12); color: #DC2626; font-weight: 600; border-radius: 999px;">
              ${r.defective}
            </span>
          </td>
          <td style="padding: 10px 14px; font-weight: 700;">${r.total}</td>
          <td style="padding: 10px 14px; font-weight: 700; color: ${healthColor};">${availPct}% available</td>
        </tr>
      `;
    }).join('');
  }

  function renderProgramShareChart() {
    const canvasEl = document.getElementById('analytics-program-chart');
    if (!canvasEl) return;

    const programCounts = {};
    assetsList.forEach(asset => {
      const prog = asset.Program || 'Unassigned';
      programCounts[prog] = (programCounts[prog] || 0) + 1;
    });

    const sortedPrograms = Object.keys(programCounts).sort();
    const chartLabels = sortedPrograms;
    const chartData = sortedPrograms.map(p => programCounts[p]);

    const chartColors = [
      '#003B5C', // Navy
      '#25E2CC', // Turquoise
      '#00A699', // Teal
      '#005A9E', // Blue accent
      '#22D3EE', // Light blue
      '#28A745', // Success Green
      '#FFC107', // Warning Yellow
      '#EF4444'  // Danger Red
    ];

    if (programChartInstance) {
      programChartInstance.destroy();
    }

    const ctx = canvasEl.getContext('2d');
    if (window.Chart) {
      programChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: chartLabels,
          datasets: [{
            data: chartData,
            backgroundColor: chartColors.slice(0, chartLabels.length),
            borderColor: '#FFFFFF',
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  family: "'Segoe UI', sans-serif",
                  size: 11,
                  weight: '600'
                },
                color: '#333333',
                padding: 12,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 59, 92, 0.95)',
              titleFont: {
                family: "'Segoe UI', sans-serif",
                size: 12,
                weight: 'bold'
              },
              bodyFont: {
                family: "'Segoe UI', sans-serif",
                size: 11
              },
              padding: 10,
              cornerRadius: 4,
              callbacks: {
                label: function (context) {
                  const val = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((val / total) * 100).toFixed(1);
                  return ` Assets: ${val} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '55%',
          animation: {
            animateScale: true,
            animateRotate: true
          }
        }
      });
    }
  }

  function renderStatusBreakdownChart() {
    const canvasEl = document.getElementById('analytics-status-chart');
    if (!canvasEl) return;

    // Group assets by status dynamically
    const statusCounts = {
      'Onsite Deployed': 0,
      'Pulled Out': 0
    };
    assetsList.forEach(asset => {
      const status = asset.Current_Status;
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    const chartLabels = Object.keys(statusCounts);
    const chartData = Object.values(statusCounts);

    const barColors = [
      'rgba(26, 115, 232, 0.85)', // Onsite Deployed - Blue
      'rgba(220, 53, 69, 0.85)'   // Pulled Out - Red
    ];
    const hoverColors = [
      'rgba(26, 115, 232, 1)',
      'rgba(220, 53, 69, 1)'
    ];

    if (statusChartInstance) {
      statusChartInstance.destroy();
    }

    const ctx = canvasEl.getContext('2d');
    if (window.Chart) {
      statusChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartLabels,
          datasets: [{
            label: 'Asset Count',
            data: chartData,
            backgroundColor: barColors,
            borderColor: barColors.map(c => c.replace('0.85', '1')),
            borderWidth: 1.5,
            hoverBackgroundColor: hoverColors,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 59, 92, 0.95)',
              titleFont: {
                family: "'Segoe UI', sans-serif",
                size: 12,
                weight: 'bold'
              },
              bodyFont: {
                family: "'Segoe UI', sans-serif",
                size: 11
              },
              padding: 10,
              cornerRadius: 4
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#E5E7EB'
              },
              ticks: {
                stepSize: 1,
                font: {
                  family: "'Segoe UI', sans-serif",
                  size: 11
                },
                color: '#666666'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  family: "'Segoe UI', sans-serif",
                  size: 11,
                  weight: '600'
                },
                color: '#333333'
              }
            }
          }
        }
      });
    }
  }

  function populateSummaryMatrix() {
    const summaryBody = document.getElementById('analytics-summary-body');
    if (!summaryBody) return;

    if (assetsList.length === 0) {
      summaryBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--color-text-muted);">No asset records found in database.</td></tr>`;
      return;
    }

    // Group items by CPU Model (normalized to uppercase/trimmed to combine cases)
    const modelsData = {};
    assetsList.forEach(asset => {
      const rawModel = (asset.CPU_Model || 'Unknown Model').trim();
      const model = rawModel.toUpperCase();
      const brand = (asset.CPU_Brand || 'Unknown').trim();
      
      if (!modelsData[model]) {
        modelsData[model] = {
          count: 0,
          brand: brand
        };
      }
      modelsData[model].count++;
      // If brand was unknown but is found in another record, update it
      if (modelsData[model].brand === 'Unknown' && brand !== 'Unknown') {
        modelsData[model].brand = brand;
      }
    });

    const total = assetsList.length;
    let rowsHtml = '';

    // Sort by count descending
    const sortedModels = Object.keys(modelsData).sort((a, b) => modelsData[b].count - modelsData[a].count);

    sortedModels.forEach(model => {
      const data = modelsData[model];
      const ratio = ((data.count / total) * 100).toFixed(1) + '%';

      rowsHtml += `
        <tr>
          <td style="padding: 10px 14px;"><strong>${model}</strong></td>
          <td style="padding: 10px 14px;">${data.count}</td>
          <td style="padding: 10px 14px;">${data.brand}</td>
          <td style="padding: 10px 14px; color: var(--color-primary); font-weight: 600;">${ratio}</td>
        </tr>
      `;
    });

    summaryBody.innerHTML = rowsHtml;
  }

  // Load analytics counts and draw charts
  loadAnalyticsData();

});
