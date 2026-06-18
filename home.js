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

  function loadPortalOverview() {
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

  function renderHomeChart() {
    const canvasEl = document.getElementById('home-program-chart');
    if (!canvasEl) return;

    // Group assets by program dynamically
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
