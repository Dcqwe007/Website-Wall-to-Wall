<?php
session_start();
// Security Guard: If no session token is found on the server, redirect to login page immediately
if (!isset($_SESSION['aether_session_token'])) {
    header("Location: index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IT System Dashboard - Home</title>
  <link rel="stylesheet" href="style.v2.css">
  
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
          <span class="header-title">System Overview Dashboard</span>
          <div class="header-status-indicator">
            <span class="indicator-dot"></span>
            <span>Portal Node Active</span>
          </div>
        </div>
      </header>

      <!-- Main Home Scrollable Workspace -->
      <main class="table-workspace" style="padding: 24px; background-color: #F4F6F9; display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Welcome Hero Banner Banner -->
        <div class="welcome-banner-card">
          <div class="banner-content">
            <h1 class="banner-title">Welcome Back, <?php echo htmlspecialchars($_SESSION['aether_username'] ?? 'IT Operator'); ?>!</h1>
            <p class="banner-subtitle">IT Wall to Wall Asset Inventory Monitoring system is active. Manage system settings, catalog computers, and generate analytics reports.</p>
          </div>
          <div class="banner-illustration">
            <i data-lucide="shield-check" style="width: 60px; height: 60px; color: #25E2CC; opacity: 0.95;"></i>
          </div>
        </div>

        <!-- KPI Summary Stats Cards Grid -->
        <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr);">
          <div class="kpi-card-tile">
            <div class="kpi-tile-icon" style="background-color: rgba(0, 90, 158, 0.1); color: #005A9E;">
              <i data-lucide="monitor"></i>
            </div>
            <div class="kpi-tile-data">
              <span class="kpi-tile-label">Total cataloged assets</span>
              <strong class="kpi-tile-value" id="kpi-total-assets">0</strong>
            </div>
          </div>

          <div class="kpi-card-tile">
            <div class="kpi-tile-icon" style="background-color: rgba(26, 115, 232, 0.1); color: #1A73E8;">
              <i data-lucide="globe"></i>
            </div>
            <div class="kpi-tile-data">
              <span class="kpi-tile-label">Onsite Deployed</span>
              <strong class="kpi-tile-value" id="kpi-onsite">0</strong>
            </div>
          </div>

          <div class="kpi-card-tile">
            <div class="kpi-tile-icon" style="background-color: rgba(220, 53, 69, 0.1); color: #DC3545;">
              <i data-lucide="archive"></i>
            </div>
            <div class="kpi-tile-data">
              <span class="kpi-tile-label">Pulled Out Assets</span>
              <strong class="kpi-tile-value" id="kpi-pulled">0</strong>
            </div>
          </div>
        </div>

        <!-- Homepage Columns Layout -->
        <div class="home-split-row">
          
          <!-- Left Column: Quick Actions & Instructions -->
          <div class="home-column-card" style="flex: 1.2;">
            <h3 class="card-section-title">
              <i data-lucide="zap" style="color: var(--bg-header-footer); width: 18px; height: 18px;"></i>
              Quick Portal Actions
            </h3>
            <p class="card-section-desc">Instantly navigate to the main asset grid workspace or launch data exports and database reports.</p>
            
            <div class="quick-action-list">
              <a href="dashboard.php" class="action-link-tile">
                <div class="action-tile-left">
                  <i data-lucide="layout-grid"></i>
                  <div class="action-tile-text">
                    <strong>Proceed to Wall to Wall Workspace</strong>
                    <span>Open dynamic data grid, apply filters, and catalog assets.</span>
                  </div>
                </div>
                <i data-lucide="arrow-right" class="arrow-icon"></i>
              </a>

              <a href="analytics.php" class="action-link-tile">
                <div class="action-tile-left">
                  <i data-lucide="pie-chart"></i>
                  <div class="action-tile-text">
                    <strong>View Reports & Analytics</strong>
                    <span>Review asset percentages, status shares, and chart graphics.</span>
                  </div>
                </div>
                <i data-lucide="arrow-right" class="arrow-icon"></i>
              </a>
            </div>

            <div class="system-status-info" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E5E7EB; display: flex; gap: 20px;">
              <div style="flex: 1;">
                <span class="status-meta-label">Gateway Status:</span>
                <span class="status-meta-val" style="color: #28A745; font-weight: 600;">Active / Online</span>
              </div>
              <div style="flex: 1;">
                <span class="status-meta-label">XAMPP Services:</span>
                <span class="status-meta-val" style="color: #28A745; font-weight: 600;">MySQL / Connected</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Program Distribution Share Preview -->
          <div class="home-column-card" style="flex: 1;">
            <h3 class="card-section-title">
              <i data-lucide="bar-chart-2" style="color: var(--bg-header-footer); width: 18px; height: 18px;"></i>
              Program Share Share
            </h3>
            <p class="card-section-desc">Distribution of workstations grouped by program categories.</p>
            
            <div style="position: relative; height: 200px; width: 100%; display: flex; align-items: center; justify-content: center; margin-top: 10px;">
              <canvas id="home-program-chart"></canvas>
            </div>
          </div>

        </div>

      </main>

    </div>

  </div>

  <!-- Toast Notification Center -->
  <div class="toast-container" id="toast-container"></div>

  <script>
    // Lucide Icon activation
    lucide.createIcons();
  </script>
  <script src="home.js"></script>
</body>
</html>
