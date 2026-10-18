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
     2. LOAD ASSETS AND COMPUTE STATISTICS
     ======================================================== */
  let assetsList = [];
  let homeProgramChart = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function loadPortalOverview() {
    fetch('api.php?action=fetch')
      .then(res => {
        if (!res.ok) throw new Error("Connection failed or unauthorized");
        return res.json();
      })
      .then(res => {
        if (res.success) {
          assetsList = (res.data || []).map(asset => ({
            ...asset,
            Program: asset.Program ?? asset.program,
            Current_Status: asset.Current_Status ?? asset.current_status
          }));
          assetsList.forEach(a => {
            if (a.Current_Status === 'Deployed') {
              a.Current_Status = 'Onsite Deployed';
            }
          });
          updateKPIs();
          renderHomeChart();
        } else {
          console.error("Fetch failed: ", res.message);
        }
      })
      .catch(err => {
        console.error("Overview load failure: ", err);
      });
  }

  function updateKPIs() {
    const totalAssetsEl = document.getElementById('kpi-total-assets');
    const onsiteEl = document.getElementById('kpi-onsite');
    const pulledEl = document.getElementById('kpi-pulled');

    const total = assetsList.length;
    const onsite = assetsList.filter(a => a.Current_Status === 'Onsite Deployed').length;
    const pulled = assetsList.filter(a => a.Current_Status === 'Pulled Out').length;

    if (totalAssetsEl) totalAssetsEl.textContent = total;
    if (onsiteEl) onsiteEl.textContent = onsite;
    if (pulledEl) pulledEl.textContent = pulled;
  }

  function getProgramCounts() {
    const programCounts = {};
    assetsList.forEach(asset => {
      const program = (asset.Program || '').toString().trim() || 'Unassigned';
      programCounts[program] = (programCounts[program] || 0) + 1;
    });
    return programCounts;
  }

  function renderProgramCounts(programCounts) {
    const countsEl = document.getElementById('home-program-counts');
    if (!countsEl) return;

    const programs = Object.keys(programCounts).sort((a, b) => {
      if (a === 'Unassigned') return 1;
      if (b === 'Unassigned') return -1;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    if (programs.length === 0) {
      countsEl.innerHTML = '<span style="grid-column: 1 / -1; color: #64748B; font-size: 12px;">No program data available.</span>';
      return;
    }

    countsEl.innerHTML = programs.map(program => `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 8px; border: 1px solid #D8E4E8; border-radius: 4px; background: #F8FAFC; font-size: 11px;">
        <span style="color: #003D5B; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(program)}</span>
        <strong style="color: #003D5B; background: #D9F8F3; border-radius: 10px; padding: 2px 7px;">${programCounts[program]}</strong>
      </div>
    `).join('');
  }

  function renderHomeChart() {
    const canvasEl = document.getElementById('home-program-chart');
    if (!canvasEl) return;

    // Group assets by program dynamically
    const programCounts = getProgramCounts();
    renderProgramCounts(programCounts);

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

    if (homeProgramChart) {
      homeProgramChart.destroy();
    }

    const ctx = canvasEl.getContext('2d');
    if (window.Chart) {
      homeProgramChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: chartLabels,
          datasets: [{
            data: chartData,
            backgroundColor: chartColors.slice(0, chartLabels.length),
            borderColor: '#FFFFFF',
            borderWidth: 2,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: {
                  family: "'Segoe UI', sans-serif",
                  size: 10,
                  weight: '600'
                },
                color: '#555555',
                boxWidth: 10,
                padding: 8,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 59, 92, 0.95)',
              titleFont: {
                family: "'Segoe UI', sans-serif",
                size: 11,
                weight: 'bold'
              },
              bodyFont: {
                family: "'Segoe UI', sans-serif",
                size: 10
              },
              padding: 8,
              cornerRadius: 4,
              callbacks: {
                label: function(context) {
                  const val = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((val / total) * 100).toFixed(1);
                  return ` Assets: ${val} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '65%',
          animation: {
            animateScale: true,
            animateRotate: true
          }
        }
      });
    }
  }

  // Load overview metrics on script execution ready
  loadPortalOverview();

});
