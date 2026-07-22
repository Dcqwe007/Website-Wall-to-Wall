<?php
session_start();
// Security Guard: If no session token is found on the server, redirect to login page immediately
if (!isset($_SESSION['aether_session_token'])) {
    header("Location: index.php");
    exit;
}
session_write_close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IT System Dashboard - Reports & Analytics</title>
  <link rel="stylesheet" href="style.v2.css?v=1.3">
  
  <!-- CDNs for Icons and Charts -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>

  <div class="portal-layout">
    
    <!-- Left Sidebar Navigation -->
    <?php include 'sidebar.php'; ?>

    <!-- Right Main Workspace Content Area -->
    <div class="main-content-area">
      
      <!-- Top Title Header -->
      <header class="top-header" style="justify-content: flex-start; gap: 20px;">
        <div class="header-brand">
          <span class="header-title">Reports & System Analytics</span>
          <div class="header-status-indicator">
            <span class="indicator-dot"></span>
            <span>Reports Processor Online</span>
          </div>
        </div>
      </header>

      <!-- Scrollable Analytics Canvas Workspace -->
      <main class="table-workspace" style="padding: 24px; background-color: #F4F6F9; display: flex; flex-direction: column; gap: 24px; overflow-y: auto;">
        
        <!-- Section: Charts Grid Layout -->
        <div class="analytics-charts-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; min-height: 420px;">
          
          <!-- Card 1: Doughnut Chart (Program Share) -->
          <div class="home-column-card" style="margin: 0; padding: 24px; display: flex; flex-direction: column;">
            <h3 class="card-section-title" style="margin-bottom: 4px;">
              <i data-lucide="pie-chart" style="color: var(--bg-header-footer); width: 18px; height: 18px;"></i>
              Program Asset Share
            </h3>
            <p class="card-section-desc" style="margin-bottom: 20px;">Percentage representation of workstations grouped by operational program.</p>
            <div style="position: relative; flex: 1; min-height: 300px; display: flex; align-items: center; justify-content: center;">
              <canvas id="analytics-program-chart"></canvas>
            </div>
          </div>

          <!-- Card 2: Bar Chart (Status Distribution) -->
          <div class="home-column-card" style="margin: 0; padding: 24px; display: flex; flex-direction: column;">
            <h3 class="card-section-title" style="margin-bottom: 4px;">
              <i data-lucide="bar-chart-3" style="color: var(--bg-header-footer); width: 18px; height: 18px;"></i>
              Asset Status Breakdown
            </h3>
            <p class="card-section-desc" style="margin-bottom: 20px;">Total workstation counts segmented by current deployment/pull-out state.</p>
            <div style="position: relative; flex: 1; min-height: 300px; display: flex; align-items: center; justify-content: center;">
              <canvas id="analytics-status-chart"></canvas>
            </div>
          </div>

        </div>

        <!-- Section: Detailed Stats Summary Matrix -->
        <div class="home-column-card" style="padding: 24px;">
          <h3 class="card-section-title" style="margin-bottom: 4px;">
            <i data-lucide="table" style="color: var(--bg-header-footer); width: 18px; height: 18px;"></i>
            Inventory Summary Matrix
          </h3>
          <p class="card-section-desc" style="margin-bottom: 20px;">Overview metrics detailing CPU models cataloged inside active nodes.</p>
          
          <div style="overflow-x: auto;">
            <table class="table-custom" style="width: 100%; border: 1px solid var(--border-color);">
              <thead>
                <tr style="background-color: var(--bg-th); color: #FFFFFF;">
                  <th style="padding: 10px 14px;">CPU Model Name</th>
                  <th style="padding: 10px 14px;">Total Count</th>
                  <th style="padding: 10px 14px;">Unique Brand</th>
                  <th style="padding: 10px 14px;">Deployment Ratio</th>
                </tr>
              </thead>
              <tbody id="analytics-summary-body" style="background-color: #FFFFFF;">
                <!-- Dynamically written by analytics.js -->
                <tr>
                  <td colspan="4" style="text-align: center; padding: 20px; color: var(--color-text-muted);">Calculating inventory summary matrix...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>

    </div>

  </div>

  <script>
    // Lucide Icon activation
    lucide.createIcons();
  </script>
  <script src="analytics.js?v=<?php echo time(); ?>"></script>
</body>
</html>
