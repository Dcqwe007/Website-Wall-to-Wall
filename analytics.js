document.addEventListener('DOMContentLoaded', () => {

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
  let programChartInstance = null;
  let statusChartInstance = null;

  function loadAnalyticsData() {
    fetch('api.php?action=fetch')
      .then(res => {
        if (!res.ok) throw new Error("Connection failed or unauthorized");
        return res.json();
      })
      .then(res => {
        if (res.success) {
          assetsList = res.data || [];
          assetsList.forEach(a => {
            if (a.Current_Status === 'Deployed') {
              a.Current_Status = 'Onsite Deployed';
            }
          });
          renderProgramShareChart();
          renderStatusBreakdownChart();
          populateSummaryMatrix();
        } else {
          console.error("Reports loading error: ", res.message);
        }
      })
      .catch(err => {
        console.error("Reports failure: ", err);
      });
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
