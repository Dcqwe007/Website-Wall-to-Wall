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

    <a href="dashboard.php?view=edit_history" class="nav-item <?php echo ($currentPage == 'dashboard.php' && isset($_GET['view']) && $_GET['view'] == 'edit_history') ? 'active' : ''; ?>" id="nav-edit-history">
      <i data-lucide="history" style="width: 16px; height: 16px;"></i>
      <span>Edit History</span>
    </a>
    <a href="dashboard.php?view=inventory" class="nav-item <?php echo ($currentPage == 'dashboard.php' && isset($_GET['view']) && $_GET['view'] == 'inventory') ? 'active' : ''; ?>" id="nav-inventory">
      <i data-lucide="archive" style="width: 16px; height: 16px;"></i>
      <span>Inventory</span>
    </a>
  </nav>
  <div class="sidebar-footer">
    <!-- About System & Creator Info (Above Dominic profile) -->
    <div class="sidebar-about-box" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 12px; font-size: 11px; color: rgba(255, 255, 255, 0.85); margin-bottom: 6px;">
      <div style="font-weight: 700; color: #25E2CC; font-size: 12px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
        <i data-lucide="info" style="width: 14px; height: 14px;"></i>
        <span>About System</span>
      </div>
      <p style="margin: 0 0 8px 0; line-height: 1.35; color: rgba(255, 255, 255, 0.7); font-size: 11px;">
        IT Wall to Wall Asset Inventory & Monitoring System for real-time workstation cataloging, tracking & system analytics.
      </p>

      <div style="margin-bottom: 8px;">
        <div style="font-weight: 600; color: rgba(255, 255, 255, 0.9); font-size: 10px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Languages & Tech Stack:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          <span style="background: rgba(37, 226, 204, 0.15); color: #25E2CC; border: 1px solid rgba(37, 226, 204, 0.3); padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600;">PHP</span>
          <span style="background: rgba(37, 226, 204, 0.15); color: #25E2CC; border: 1px solid rgba(37, 226, 204, 0.3); padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600;">JavaScript</span>
          <span style="background: rgba(37, 226, 204, 0.15); color: #25E2CC; border: 1px solid rgba(37, 226, 204, 0.3); padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600;">HTML5</span>
          <span style="background: rgba(37, 226, 204, 0.15); color: #25E2CC; border: 1px solid rgba(37, 226, 204, 0.3); padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600;">CSS3</span>
          <span style="background: rgba(37, 226, 204, 0.15); color: #25E2CC; border: 1px solid rgba(37, 226, 204, 0.3); padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600;">MySQL</span>
        </div>
      </div>

      <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 6px; margin-top: 6px;">
        <span style="color: rgba(255, 255, 255, 0.5); font-size: 10px; display: block;">System Creator & Developer:</span>
        <strong style="color: #FFFFFF; font-size: 11.5px; display: block;">Dominic Carreon</strong>
        <span style="color: #25E2CC; font-size: 10.5px; display: block; font-weight: 500;">IT Representative UP2</span>
      </div>
    </div>

    <div class="user-profile">
      <div class="user-avatar" style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <i data-lucide="user" style="width: 16px; height: 16px; color: #FFFFFF;"></i>
      </div>
      <div class="user-info">
        <span class="user-name" style="font-weight: 600; font-size: 13px; color: #FFFFFF; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px;"><?php echo htmlspecialchars($_SESSION['aether_username'] ?? 'Dominic Carreon'); ?></span>
        <span class="user-role" style="font-size: 11px; color: rgba(255, 255, 255, 0.5); display: block;">Administrator</span>
      </div>
    </div>
    <button class="btn-logout-sidebar" id="btn-logout-sidebar">
      <i data-lucide="log-out" style="width: 14px; height: 14px;"></i>
      <span>Logout</span>
    </button>
  </div>
</aside>
