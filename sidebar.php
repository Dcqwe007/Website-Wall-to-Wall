<?php
$currentPage = basename($_SERVER['PHP_SELF']);
?>
<aside class="sidebar-left">
  <div class="sidebar-brand">
    <div class="header-logo-box" style="background: transparent; padding: 0; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
      <img src="logo.png" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">
    </div>
    <span class="sidebar-brand-name">IT monitoring</span>
  </div>
  <nav class="sidebar-nav">
    <a href="home.php" class="nav-item <?php echo ($currentPage == 'home.php') ? 'active' : ''; ?>" id="nav-home">
      <i data-lucide="home" style="width: 16px; height: 16px;"></i>
      <span>Home Dashboard</span>
    </a>
    <a href="dashboard.php" class="nav-item <?php echo ($currentPage == 'dashboard.php' && !isset($_GET['view'])) ? 'active' : ''; ?>" id="nav-grid">
      <i data-lucide="layout-grid" style="width: 16px; height: 16px;"></i>
      <span>Wall to Wall</span>
    </a>
    <a href="analytics.php" class="nav-item <?php echo ($currentPage == 'analytics.php') ? 'active' : ''; ?>" id="nav-analytics">
      <i data-lucide="pie-chart" style="width: 16px; height: 16px;"></i>
      <span>Analytics</span>
    </a>
    <a href="dashboard.php?view=cpu_ping" class="nav-item <?php echo ($currentPage == 'dashboard.php' && isset($_GET['view']) && $_GET['view'] == 'cpu_ping') ? 'active' : ''; ?>" id="nav-cpu-ping-monitoring">
      <i data-lucide="activity" style="width: 16px; height: 16px;"></i>
      <span>CPU Ping Monitoring</span>
    </a>
    <a href="dashboard.php?view=edit_history" class="nav-item <?php echo ($currentPage == 'dashboard.php' && isset($_GET['view']) && $_GET['view'] == 'edit_history') ? 'active' : ''; ?>" id="nav-edit-history">
      <i data-lucide="history" style="width: 16px; height: 16px;"></i>
      <span>Edit History</span>
    </a>
  </nav>
  <div class="sidebar-footer">
    <div class="user-profile">
      <div class="user-avatar" style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <i data-lucide="user" style="width: 16px; height: 16px; color: #FFFFFF;"></i>
      </div>
      <div class="user-info">
        <span class="user-name" style="font-weight: 600; font-size: 13px; color: #FFFFFF; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px;"><?php echo htmlspecialchars($_SESSION['aether_username'] ?? 'IT Operator'); ?></span>
        <span class="user-role" style="font-size: 11px; color: rgba(255, 255, 255, 0.5); display: block;">Administrator</span>
      </div>
    </div>
    <button class="btn-logout-sidebar" id="btn-logout-sidebar">
      <i data-lucide="log-out" style="width: 14px; height: 14px;"></i>
      <span>Logout</span>
    </button>
  </div>
</aside>
