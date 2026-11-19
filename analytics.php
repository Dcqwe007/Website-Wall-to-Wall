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
        
        <!-- Section: Hardware Availability KPI Summary Cards (Storage Only) -->
        <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
          <div class="kpi-card-tile">
            <div class="kpi-tile-icon" style="background-color: rgba(16, 185, 129, 0.12); color: #10B981;">
              <i data-lucide="cpu"></i>
            </div>
            <div class="kpi-tile-data">
              <span class="kpi-tile-label">Available CPUs (Storage)</span>
              <strong class="kpi-tile-value" id="kpi-available-cpu" style="color: #059669;">0</strong>
            </div>
          </div>

          <div class="kpi-card-tile">
            <div class="kpi-tile-icon" style="background-color: rgba(37, 226, 204, 0.18); color: #008779;">
              <i data-lucide="monitor"></i>
            </div>
            <div class="kpi-tile-data">
              <span class="kpi-tile-label">Available Monitors (Storage)</span>
              <strong class="kpi-tile-value" id="kpi-available-monitor" style="color: #008779;">0</strong>
            </div>
          </div>

          <div class="kpi-card-tile">
            <div class="kpi-tile-icon" style="background-color: rgba(0, 61, 91, 0.1); color: #003D5B;">
              <i data-lucide="archive"></i>
            </div>
            <div class="kpi-tile-data">
              <span class="kpi-tile-label">Total Storage Inventory</span>
              <strong class="kpi-tile-value" id="kpi-total-storage" style="color: #003D5B;">0</strong>
            </div>
          </div>

          <div class="kpi-card-tile">
            <div class="kpi-tile-icon" style="background-color: rgba(239, 68, 68, 0.12); color: #DC2626;">
              <i data-lucide="alert-triangle"></i>
            </div>
            <div class="kpi-tile-data">
              <span class="kpi-tile-label">Defective / Repair in Storage</span>
              <strong class="kpi-tile-value" id="kpi-defective-assets" style="color: #DC2626;">0</strong>
            </div>
          </div>
        </div>

        <!-- Section: Storage Availability (CPUs vs Monitors) Charts Grid -->
        <div class="analytics-charts-grid" style="display: grid; grid-template-columns: 1.35fr 1fr; gap: 24px; min-height: 420px;">
          
          <!-- Card A: Grouped Bar Chart (Storage Availability: CPUs vs Monitors) -->
          <div class="home-column-card" style="margin: 0; padding: 24px; display: flex; flex-direction: column;">
            <h3 class="card-section-title" style="margin-bottom: 4px;">
              <i data-lucide="layers" style="color: var(--bg-header-footer); width: 18px; height: 18px;"></i>
              Storage Room Availability: CPUs vs Monitors
            </h3>
            <p class="card-section-desc" style="margin-bottom: 20px;">Inventory counts in storage rooms only: ready for deployment vs defective / in repair.</p>
            <div style="position: relative; flex: 1; min-height: 300px; display: flex; align-items: center; justify-content: center;">
              <canvas id="analytics-availability-chart"></canvas>
            </div>
          </div>

          <!-- Card B: Doughnut Chart (Available Storage Stock Distribution) -->
          <div class="home-column-card" style="margin: 0; padding: 24px; display: flex; flex-direction: column;">
            <h3 class="card-section-title" style="margin-bottom: 4px;">
              <i data-lucide="archive" style="color: var(--bg-header-footer); width: 18px; height: 18px;"></i>
              Available Storage Stock Distribution
            </h3>
            <p class="card-section-desc" style="margin-bottom: 20px;">Proportion of available, ready-to-deploy spare inventory currently in storage rooms.</p>
            <div style="position: relative; flex: 1; min-height: 300px; display: flex; align-items: center; justify-content: center;">
              <canvas id="analytics-available-share-chart"></canvas>
            </div>
          </div>

        </div>

        <!-- Section: Storage Room Stock Matrix Table -->
        <div class="home-column-card" style="padding: 24px;">
          <h3 class="card-section-title" style="margin-bottom: 4px;">
            <i data-lucide="boxes" style="color: var(--bg-header-footer); width: 18px; height: 18px;"></i>
            Storage Inventory & Availability Matrix
          </h3>
          <p class="card-section-desc" style="margin-bottom: 20px;">Detailed inventory counts of CPUs, monitors, and components stored in storage rooms.</p>
          <div style="overflow-x: auto;">
            <table class="table-custom" style="width: 100%; border: 1px solid var(--border-color);">
              <thead>
                <tr style="background-color: var(--bg-th); color: #FFFFFF;">
                  <th style="padding: 10px 14px;">Hardware Type</th>
                  <th style="padding: 10px 14px;">Available (Ready to Deploy)</th>
                  <th style="padding: 10px 14px;">Defective / Under Repair</th>
                  <th style="padding: 10px 14px;">Total in Storage</th>
                  <th style="padding: 10px 14px;">Availability Rate</th>
                </tr>
              </thead>
              <tbody id="analytics-availability-table-body" style="background-color: #FFFFFF;">
                <tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--color-text-muted);">Calculating storage availability...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section: Charts Grid Layout (Program & Status) -->
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

        <!-- Section: Program Asset Counts -->
        <div class="home-column-card" style="padding: 24px;">
          <h3 class="card-section-title" style="margin-bottom: 4px;">
            <i data-lucide="list-ordered" style="color: var(--bg-header-footer); width: 18px; height: 18px;"></i>
            Asset Count by Wall-to-Wall Program
          </h3>
          <p class="card-section-desc" style="margin-bottom: 20px;">Exact workstation asset count assigned to every Wall-to-Wall program.</p>
          <div style="overflow-x: auto;">
            <table class="table-custom" style="width: 100%; border: 1px solid var(--border-color);">
              <thead>
                <tr style="background-color: var(--bg-th); color: #FFFFFF;">
                  <th style="padding: 10px 14px;">Program</th>
                  <th style="padding: 10px 14px;">Asset Count</th>
                  <th style="padding: 10px 14px;">Percentage</th>
                </tr>
              </thead>
              <tbody id="analytics-program-count-body" style="background-color: #FFFFFF;">
                <tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--color-text-muted);">Calculating program counts...</td></tr>
              </tbody>
            </table>
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
