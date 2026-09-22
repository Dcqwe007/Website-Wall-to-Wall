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
  <title>IT Wall to Wall Monitoring System</title>
  <link rel="stylesheet" href="style.v2.css?v=1.6">
  
  <!-- CDN for Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- CDN for Charts -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>

  <!-- Background Decorative Glowing Elements (Hidden in Style but preserved for fallback) -->
  <div class="bg-glow bg-glow-1"></div>
  <div class="bg-glow bg-glow-2"></div>
  <div class="bg-glow bg-glow-3"></div>

  <div class="portal-layout">
    
    <!-- Left Sidebar Navigation -->
    <?php include 'sidebar.php'; ?>

    <!-- Right Main Workspace Content Area -->
    <div class="main-content-area">
      <div class="dashboard-container">
    
    <!-- Top Header Navigation & Action Bar -->
    <header class="top-header">
      <div class="header-brand">
        <div class="header-logo-box" style="background: transparent; padding: 0; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          <img src="logo.png" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
        <div class="header-title-wrapper">
          <span class="header-title">IT Wall to Wall Monitoring System</span>
          <div class="header-status-indicator">
            <span class="indicator-dot"></span>
            <span>Gateway Node Active</span>
          </div>
        </div>
      </div>

      <!-- Action Panel Buttons (CRUD) -->
      <div class="action-panel">
        <button class="btn-action" id="btn-delete" disabled>Delete</button>
        <button class="btn-action" id="btn-add">Add</button>
        <button class="btn-action" id="btn-edit" disabled>Edit</button>
        <button class="btn-action" id="btn-update-status" disabled>Update Status</button>
        <button class="btn-action" id="btn-goto-inventory" style="background-color: #003D5B; color: #FFFFFF; border-color: #003D5B; opacity: 1; font-weight: 600; padding: 6px 14px; border-radius: 4px; cursor: pointer;">Inventory</button>
      </div>
    </header>

    <!-- Search & Filters Toolbar Panel -->
    <div class="toolbar-search-filter">
      <div class="toolbar-title" id="toolbar-page-title">Workspace Inventory Records</div>
      <div class="filter-panel" id="asset-filters-panel">
        <div class="search-box-wrapper">
          <input type="text" placeholder="Search..." class="search-box-input" id="search-input">
          <i data-lucide="search" class="search-icon" style="width: 15px; height: 15px;"></i>
        </div>
        <button class="btn-toggle-filters" id="btn-toggle-filters">
          <i data-lucide="sliders" style="width: 14px; height: 14px;"></i>
          <span>Filters</span>
          <span class="active-filter-badge" id="active-filter-count" style="display: none;">0</span>
        </button>
      </div>
      <div class="filter-panel" id="history-filters-panel" style="display: none;">
        <div class="search-box-wrapper">
          <input type="text" placeholder="Search history..." class="search-box-input" id="history-search-input">
          <i data-lucide="search" class="search-icon" style="width: 15px; height: 15px;"></i>
        </div>
      </div>
      <div class="filter-panel" id="inventory-filters-panel" style="display: none;">
        <div class="search-box-wrapper">
          <input type="text" placeholder="Search inventory..." class="search-box-input" id="inventory-search-input">
          <i data-lucide="search" class="search-icon" style="width: 15px; height: 15px;"></i>
        </div>
      </div>
      <div class="filter-panel" id="storage-filters-panel" style="display: none; gap: 10px;">
        <div class="search-box-wrapper">
          <input type="text" placeholder="Search storage..." class="search-box-input" id="storage-search-input">
          <i data-lucide="search" class="search-icon" style="width: 15px; height: 15px;"></i>
        </div>
        <button class="btn-action" id="btn-add-storage-item" type="button" style="background: #25E2CC; color: #002B3D; border: none; font-weight: 600; padding: 6px 14px; border-radius: 4px; cursor: pointer;">
          <i data-lucide="plus" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>Add Storage Item
        </button>
      </div>
    </div>

    <!-- Collapsible Filter Drawer -->
    <div class="filter-drawer" id="filter-drawer">
      <div class="filter-drawer-header">
        <span class="filter-drawer-title">
          <i data-lucide="filter" style="width: 16px; height: 16px; color: var(--bg-header-footer);"></i>
          Refine Assets Workspace
        </span>
        <button type="button" class="btn-clear-filters" id="btn-clear-filters">
          <i data-lucide="filter-x" style="width: 14px; height: 14px;"></i>
          Clear All Filters
        </button>
      </div>
      <div class="filter-grid">
        <div class="filter-group">
          <label class="filter-label">Asset</label>
          <select class="filter-select" id="select-asset">
            <option value="All">All Assets</option>
            <option value="CPU">CPU</option>
            <option value="Monitor">Monitor</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Program</label>
          <select class="filter-select" id="select-program">
            <option value="All">All Programs</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Located Floor</label>
          <select class="filter-select" id="select-floor">
            <option value="All">All Floors</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Site Node</label>
          <select class="filter-select" id="select-site">
            <option value="All">All Sites</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Current Status</label>
          <select class="filter-select" id="select-status">
            <option value="All">All Statuses</option>
          </select>
        </div>
      </div>
    </div>


    <!-- Edit History View Active Banner -->
    <div class="edit-history-banner" id="edit-history-banner" style="display: none; background: #E2ECEB; border: 1px solid #A8D8D5; border-radius: 4px; padding: 12px 20px; margin: 10px 20px; align-items: center; justify-content: space-between; font-size: 14px; color: #003D5B; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="history" style="width: 16px; height: 16px; color: #003D5B;"></i>
        <span><strong>Asset Edit History Log Active</strong>: Reviewing all previous modifications, additions, and deletions.</span>
      </div>
      <button class="btn-clear-history-view" id="btn-clear-history-view" style="background: #003D5B; border: none; color: white; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; font-size: 12px;" onmouseover="this.style.background='#002535'" onmouseout="this.style.background='#003D5B'">
        Show Asset Grid
      </button>
    </div>

    <!-- Replaced Components Inventory View Active Banner -->
    <div class="edit-history-banner" id="inventory-banner" style="display: none; background: #FFF3CD; border: 1px solid #FFEBA8; border-radius: 4px; padding: 12px 20px; margin: 10px 20px; align-items: center; justify-content: space-between; font-size: 14px; color: #856404; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="archive" style="width: 16px; height: 16px; color: #856404;"></i>
        <span><strong>Replaced Components Inventory Active</strong>: Reviewing all individual CPUs/Monitors replaced during edits.</span>
      </div>
      <button class="btn-clear-history-view" id="btn-clear-inventory-view" style="background: #856404; border: none; color: white; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; font-size: 12px;" onmouseover="this.style.background='#5a4303'" onmouseout="this.style.background='#856404'">
        Show Asset Grid
      </button>
    </div>

    <!-- Storage Management View Active Banner -->
    <div class="edit-history-banner" id="storage-banner" style="display: none; background: #D1E7DD; border: 1px solid #A3CFBB; border-radius: 4px; padding: 12px 20px; margin: 10px 20px; align-items: center; justify-content: space-between; font-size: 14px; color: #0F5132; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="box" style="width: 16px; height: 16px; color: #0F5132;"></i>
        <span><strong>IT Equipment Storage Active</strong>: Tracking spare hardware, backup components, cables, and storage room inventory.</span>
      </div>
      <button class="btn-clear-history-view" id="btn-clear-storage-view" style="background: #0F5132; border: none; color: white; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; font-size: 12px;" onmouseover="this.style.background='#0a3622'" onmouseout="this.style.background='#0F5132'">
        Show Asset Grid
      </button>
    </div>

    <!-- Main Table Workspace -->
    <main class="table-workspace">
      <table class="table-custom" id="assets-table">
        <thead>
          <tr>
            <th data-sort="Station_Number" class="cpu-ping-visible">Station No.<span class="sort-indicator"></span></th>
            <th data-sort="CPU_Model" class="cpu-ping-visible">CPU Model<span class="sort-indicator"></span></th>
            <th data-sort="CPU_Serial">CPU Serial<span class="sort-indicator"></span></th>
            <th data-sort="CPU_Brand">CPU Brand<span class="sort-indicator"></span></th>
            <th data-sort="Monitor1_Model">Mon1 Model<span class="sort-indicator"></span></th>
            <th data-sort="Monitor1_Serial">Mon1 Serial<span class="sort-indicator"></span></th>
            <th data-sort="Monitor1_Brand">Mon1 Brand<span class="sort-indicator"></span></th>
            <th data-sort="Monitor2_Model">Mon2 Model<span class="sort-indicator"></span></th>
            <th data-sort="Monitor2_Serial">Mon2 Serial<span class="sort-indicator"></span></th>
            <th data-sort="Monitor2_Brand">Mon2 Brand<span class="sort-indicator"></span></th>
            <th data-sort="Monitor3_Model">Mon3 Model<span class="sort-indicator"></span></th>
            <th data-sort="Monitor3_Serial">Mon3 Serial<span class="sort-indicator"></span></th>
            <th data-sort="Monitor3_Brand">Mon3 Brand<span class="sort-indicator"></span></th>
            <th data-sort="Program" class="cpu-ping-visible">Program<span class="sort-indicator"></span></th>
            <th data-sort="Asset_located_floor" class="cpu-ping-visible">Floor<span class="sort-indicator"></span></th>
            <th data-sort="Site" class="cpu-ping-visible">Site<span class="sort-indicator"></span></th>
            <th data-sort="Current_Status">Status<span class="sort-indicator"></span></th>
            <th data-sort="Created_Date">Created<span class="sort-indicator"></span></th>
            <th data-sort="Modified_Date">Modified<span class="sort-indicator"></span></th>
          </tr>
        </thead>
        <tbody id="assets-table-body">
          <!-- Populated dynamically by JavaScript API fetch -->
        </tbody>
      </table>

      <!-- History Log Table -->
      <table class="table-custom" id="history-table" style="display: none;">
        <thead>
          <tr>
            <th data-sort-history="changed_at" class="sorted-desc">Date & Time<span class="sort-indicator-history"> ▼</span></th>
            <th data-sort-history="station_number">Station No.<span class="sort-indicator-history"></span></th>
            <th data-sort-history="action_type">Action Type<span class="sort-indicator-history"></span></th>
            <th data-sort-history="username">Operator<span class="sort-indicator-history"></span></th>
            <th data-sort-history="details">Modification Details<span class="sort-indicator-history"></span></th>
          </tr>
        </thead>
        <tbody id="history-table-body">
          <!-- Populated dynamically by JS -->
        </tbody>
      </table>

      <!-- Hardware Inventory Table -->
      <table class="table-custom" id="inventory-table" style="display: none; width: 100%;">
        <thead>
          <tr>
            <th data-sort-inventory="removed_at" class="sorted-desc">Date Changed<span class="sort-indicator-inventory"> ▼</span></th>
            <th data-sort-inventory="previous_station">Station No.<span class="sort-indicator-inventory"></span></th>
            <th data-sort-inventory="asset_type">Asset Type<span class="sort-indicator-inventory"></span></th>
            <th data-sort-inventory="brand">Brand<span class="sort-indicator-inventory"></span></th>
            <th data-sort-inventory="serial_number">Serial Number<span class="sort-indicator-inventory"></span></th>
            <th data-sort-inventory="username">Operator<span class="sort-indicator-inventory"></span></th>
            <th data-sort-inventory="status">Status<span class="sort-indicator-inventory"></span></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="inventory-table-body">
          <!-- Populated dynamically by JS -->
        </tbody>
      </table>

      <!-- Storage Table -->
      <table class="table-custom" id="storage-table" style="display: none; width: 100%;">
        <thead>
          <tr>
            <th data-sort-storage="added_at" class="sorted-desc">Date Added<span class="sort-indicator-storage"> ▼</span></th>
            <th data-sort-storage="asset_type">Asset Type<span class="sort-indicator-storage"></span></th>
            <th data-sort-storage="brand">Brand<span class="sort-indicator-storage"></span></th>
            <th data-sort-storage="model">Model<span class="sort-indicator-storage"></span></th>
            <th data-sort-storage="serial_number">Serial Number / Tag<span class="sort-indicator-storage"></span></th>
            <th data-sort-storage="location">Storage Location<span class="sort-indicator-storage"></span></th>
            <th data-sort-storage="quantity">Qty<span class="sort-indicator-storage"></span></th>
            <th data-sort-storage="username">Operator<span class="sort-indicator-storage"></span></th>
            <th data-sort-storage="status">Status<span class="sort-indicator-storage"></span></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="storage-table-body">
          <!-- Populated dynamically by JS -->
        </tbody>
      </table>
      
      <!-- Empty State indicator -->
      <div class="table-empty-state" id="table-empty-message" style="display: none;">
        <i data-lucide="inbox" style="width: 48px; height: 48px; margin: 0 auto;"></i>
        <p id="empty-message-text">No matching asset records found.</p>
      </div>
    </main>

    <!-- Bottom Footer Controls -->
    <footer class="bottom-footer">
      <div class="footer-left">
        <button class="btn-footer" id="btn-refresh">
          <i data-lucide="refresh-ccw" style="width: 14px; height: 14px;" id="refresh-icon"></i>
          Refresh
        </button>
      </div>
      
      <div class="footer-stats" id="footer-stats-text">
        Total Assets: <strong>0</strong> | Selected: <strong>None</strong>
      </div>

      <div class="footer-right">
        <button class="btn-footer" id="btn-export-csv">Export CSV</button>
        <button class="btn-footer" id="btn-export-history-csv" style="display: none;">Export History CSV</button>
        <button class="btn-footer" id="btn-export-inventory-csv" style="display: none;">Export Inventory CSV</button>
        <button class="btn-footer" id="btn-export-storage-csv" style="display: none;">Export Storage CSV</button>
      </div>
    </footer>

      </div> <!-- End dashboard-container -->
    </div> <!-- End main-content-area -->
  </div> <!-- End portal-layout -->

  <!-- ==========================================
     MODALS POPUPS
     ========================================== -->

  <!-- Modal 1: Add Asset -->
  <div class="modal-overlay" id="modal-add">
    <div class="glass-panel modal-card">
      <div class="modal-header">
        <h2 class="modal-title">
          <i data-lucide="plus-circle" style="color: var(--bg-header-footer);"></i>
          Add New Asset
        </h2>
        <button class="btn-modal-close" id="btn-close-add">
          <i data-lucide="x" style="width: 20px; height: 20px;"></i>
        </button>
      </div>
      <form id="form-add-asset">
        <div class="modal-grid">
          <div class="form-group">
            <label class="form-label">Station Number</label>
            <input type="number" class="modal-input-field" id="add-station" required placeholder="e.g. 101">
          </div>
          <div class="form-group">
            <label class="form-label">CPU Model</label>
            <select class="modal-input-field" id="add-cpu-model">
              <option value="">-- Select CPU Model --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">CPU Serial</label>
            <input type="text" class="modal-input-field" id="add-cpu-serial" placeholder="e.g. 3CQ4210V7V">
          </div>
          <div class="form-group">
            <label class="form-label">CPU Brand</label>
            <select class="modal-input-field" id="add-cpu-brand">
              <option value="">-- Select CPU Brand --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 1 Model</label>
            <select class="modal-input-field" id="add-mon1-model">
              <option value="">-- None / Select Monitor Model --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 1 Serial</label>
            <input type="text" class="modal-input-field" id="add-mon1-serial" placeholder="e.g. 6CM3413S1B">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 1 Brand</label>
            <select class="modal-input-field" id="add-mon1-brand">
              <option value="">-- None / Select Monitor Brand --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 2 Model</label>
            <select class="modal-input-field" id="add-mon2-model">
              <option value="">-- None / Select Monitor Model --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 2 Serial</label>
            <input type="text" class="modal-input-field" id="add-mon2-serial" placeholder="e.g. 0LU4HTKQ100216B">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 2 Brand</label>
            <select class="modal-input-field" id="add-mon2-brand">
              <option value="">-- None / Select Monitor Brand --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 3 Model</label>
            <select class="modal-input-field" id="add-mon3-model">
              <option value="">-- None / Select Monitor Model --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 3 Serial</label>
            <input type="text" class="modal-input-field" id="add-mon3-serial" placeholder="e.g. CN07F10V5U">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 3 Brand</label>
            <select class="modal-input-field" id="add-mon3-brand">
              <option value="">-- None / Select Monitor Brand --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Program</label>
            <select class="modal-input-field" id="add-program">
              <option value="">-- Select Program --</option>
              <option value="Macys">Macys</option>
              <option value="Elevance">Elevance</option>
              <option value="Oscar">Oscar</option>
              <option value="UHG">UHG</option>
              <option value="Highmark">Highmark</option>
              <option value="Xerox">Xerox</option>
              <option value="Nike">Nike</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Located Floor</label>
            <select class="modal-input-field" id="add-floor">
              <option value="">-- Select Located Floor --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Site</label>
            <input type="text" class="modal-input-field" id="add-site" placeholder="e.g. UP2">
          </div>
          <div class="form-group">
            <label class="form-label">Current Status</label>
            <select class="modal-input-field" id="add-status">
              <option value="Onsite Deployed">Onsite Deployed</option>
              <option value="Pulled Out">Pulled Out</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-action" id="btn-cancel-add">Cancel</button>
          <button type="submit" class="btn-action btn-primary" style="width: auto;">Save Asset</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal 2: Edit Asset -->
  <div class="modal-overlay" id="modal-edit">
    <div class="glass-panel modal-card">
      <div class="modal-header">
        <h2 class="modal-title">
          <i data-lucide="edit-3" style="color: var(--bg-header-footer);"></i>
          Edit Asset Information
        </h2>
        <button class="btn-modal-close" id="btn-close-edit">
          <i data-lucide="x" style="width: 20px; height: 20px;"></i>
        </button>
      </div>
      <form id="form-edit-asset">
        <input type="hidden" id="edit-station-key">
        <div class="modal-grid">
          <div class="form-group">
            <label class="form-label">Station Number</label>
            <input type="number" class="modal-input-field" id="edit-station" required>
          </div>
          <div class="form-group">
            <label class="form-label">CPU Model</label>
            <select class="modal-input-field" id="edit-cpu-model">
              <option value="">-- Select CPU Model --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">CPU Serial</label>
            <input type="text" class="modal-input-field" id="edit-cpu-serial">
          </div>
          <div class="form-group">
            <label class="form-label">CPU Brand</label>
            <select class="modal-input-field" id="edit-cpu-brand">
              <option value="">-- Select CPU Brand --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 1 Model</label>
            <select class="modal-input-field" id="edit-mon1-model">
              <option value="">-- None / Select Monitor Model --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 1 Serial</label>
            <input type="text" class="modal-input-field" id="edit-mon1-serial">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 1 Brand</label>
            <select class="modal-input-field" id="edit-mon1-brand">
              <option value="">-- None / Select Monitor Brand --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 2 Model</label>
            <select class="modal-input-field" id="edit-mon2-model">
              <option value="">-- None / Select Monitor Model --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 2 Serial</label>
            <input type="text" class="modal-input-field" id="edit-mon2-serial">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 2 Brand</label>
            <select class="modal-input-field" id="edit-mon2-brand">
              <option value="">-- None / Select Monitor Brand --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 3 Model</label>
            <select class="modal-input-field" id="edit-mon3-model">
              <option value="">-- None / Select Monitor Model --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 3 Serial</label>
            <input type="text" class="modal-input-field" id="edit-mon3-serial">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 3 Brand</label>
            <select class="modal-input-field" id="edit-mon3-brand">
              <option value="">-- None / Select Monitor Brand --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Program</label>
            <select class="modal-input-field" id="edit-program">
              <option value="">-- Select Program --</option>
              <option value="Macys">Macys</option>
              <option value="Elevance">Elevance</option>
              <option value="Oscar">Oscar</option>
              <option value="UHG">UHG</option>
              <option value="Highmark">Highmark</option>
              <option value="Xerox">Xerox</option>
              <option value="Nike">Nike</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Located Floor</label>
            <select class="modal-input-field" id="edit-floor">
              <option value="">-- Select Located Floor --</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Site</label>
            <input type="text" class="modal-input-field" id="edit-site">
          </div>
          <div class="form-group">
            <label class="form-label">Current Status</label>
            <select class="modal-input-field" id="edit-status">
              <option value="Onsite Deployed">Onsite Deployed</option>
              <option value="Pulled Out">Pulled Out</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-action" id="btn-cancel-edit">Cancel</button>
          <button type="submit" class="btn-action btn-primary" style="width: auto;">Update Asset</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal 3: Update Status Quick Dialog -->
  <div class="modal-overlay" id="modal-status">
    <div class="glass-panel modal-card" style="max-width: 400px; padding: 24px;">
      <div class="modal-header" style="margin-bottom: 16px;">
        <h2 class="modal-title" style="font-size: 17px;">
          <i data-lucide="refresh-cw" style="color: var(--bg-header-footer); width: 18px; height: 18px;"></i>
          Quick Status Change
        </h2>
        <button class="btn-modal-close" id="btn-close-status">
          <i data-lucide="x" style="width: 18px; height: 18px;"></i>
        </button>
      </div>
      <form id="form-update-status">
        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label">Transition selected asset to:</label>
          <select class="modal-input-field" id="quick-status-select">
            <option value="Onsite Deployed">Onsite Deployed</option>
            <option value="Pulled Out">Pulled Out</option>
          </select>
        </div>
        <div class="modal-actions" style="padding-top: 16px;">
          <button type="button" class="btn-action" id="btn-cancel-status">Cancel</button>
          <button type="submit" class="btn-action btn-primary" style="width: auto;">Update</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal 4: Delete Confirmation Dialog -->
  <div class="modal-overlay" id="modal-delete">
    <div class="glass-panel modal-card" style="max-width: 420px; padding: 24px;">
      <div class="modal-header" style="margin-bottom: 16px;">
        <h2 class="modal-title" style="font-size: 17px; color: #EF4444;">
          <i data-lucide="trash-2" style="color: #EF4444; width: 18px; height: 18px;"></i>
          Confirm Delete
        </h2>
        <button class="btn-modal-close" id="btn-close-delete-modal">
          <i data-lucide="x" style="width: 18px; height: 18px;"></i>
        </button>
      </div>
      <div style="margin-bottom: 24px; color: #4B5563; font-size: 14px; line-height: 1.5;">
        Are you sure you want to permanently delete the selected asset <strong id="delete-asset-serial-label" style="color: #111827; font-family: monospace;"></strong>? This action cannot be undone.
      </div>
      <div class="modal-actions" style="padding-top: 16px; border-top: 1px solid #E5E7EB;">
        <button type="button" class="btn-action" id="btn-cancel-delete-modal">Cancel</button>
        <button type="button" class="btn-action btn-primary" id="btn-confirm-delete" style="width: auto; background-color: #EF4444; border-color: #EF4444;">Delete</button>
      </div>
    </div>
  </div>

  <!-- Modal 5: Add Storage Item -->
  <div class="modal-overlay" id="modal-add-storage">
    <div class="glass-panel modal-card" style="max-width: 520px; padding: 24px;">
      <div class="modal-header" style="margin-bottom: 16px;">
        <h2 class="modal-title" style="font-size: 17px;">
          <i data-lucide="box" style="color: var(--bg-header-footer); width: 18px; height: 18px;"></i>
          Add New Storage Item
        </h2>
        <button class="btn-modal-close" id="btn-close-add-storage">
          <i data-lucide="x" style="width: 18px; height: 18px;"></i>
        </button>
      </div>
      <form id="form-add-storage">
        <div class="modal-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Type of Asset</label>
            <select class="modal-input-field" id="storage-asset-type" required>
              <option value="CPU">CPU</option>
              <option value="Monitor">Monitor</option>
              <option value="Keyboard">Keyboard</option>
              <option value="Mouse">Mouse</option>
              <option value="Cable / Adapter">Cable / Adapter</option>
              <option value="RAM / Component">RAM / Component</option>
              <option value="Other Hardware">Other Hardware</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Brand</label>
            <input type="text" class="modal-input-field" id="storage-brand" placeholder="e.g. HP, Dell, Samsung" required>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Model</label>
            <input type="text" class="modal-input-field" id="storage-model" placeholder="e.g. ProDisplay P201" required>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Serial Number</label>
            <input type="text" class="modal-input-field" id="storage-serial" placeholder="e.g. 3CQ4210W7V" required>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Status (Condition)</label>
            <select class="modal-input-field" id="storage-status" required>
              <option value="Working">Working</option>
              <option value="Disposal">Disposal</option>
              <option value="In Storage">In Storage</option>
              <option value="For Repair">For Repair</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Operator</label>
            <input type="text" class="modal-input-field" id="storage-operator" value="<?php echo htmlspecialchars($_SESSION['aether_username'] ?? 'Dominic Carreon'); ?>" required>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Storage Location</label>
            <input type="text" class="modal-input-field" id="storage-location" value="Main Storage Room" placeholder="e.g. Cabinet A-1" required>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Quantity</label>
            <input type="number" class="modal-input-field" id="storage-qty" value="1" min="1" required>
          </div>
        </div>

        <!-- Checkbox option to also register as active workstation asset -->
        <div style="background: rgba(37, 226, 204, 0.1); border: 1px solid rgba(37, 226, 204, 0.3); border-radius: 6px; padding: 12px; margin-top: 14px; margin-bottom: 16px;">
          <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #003D5B; cursor: pointer; font-size: 13px;">
            <input type="checkbox" id="storage-also-add-asset" style="width: 16px; height: 16px; accent-color: #25E2CC;">
            <span>Also Add as Active Asset in Wall to Wall Grid</span>
          </label>
          
          <div id="storage-asset-details-panel" style="display: none; margin-top: 12px; border-top: 1px dashed rgba(0, 61, 91, 0.2); padding-top: 10px;">
            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label" style="font-size: 11px;">Target Station Number</label>
              <input type="number" class="modal-input-field" id="storage-asset-station" placeholder="e.g. 101">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 10px;">Program</label>
                <input type="text" class="modal-input-field" id="storage-asset-program" placeholder="e.g. Macys">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 10px;">Floor</label>
                <input type="text" class="modal-input-field" id="storage-asset-floor" placeholder="e.g. 4th">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 10px;">Site</label>
                <input type="text" class="modal-input-field" id="storage-asset-site" placeholder="e.g. UP2">
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions" style="padding-top: 16px; border-top: 1px solid #E5E7EB;">
          <button type="button" class="btn-action" id="btn-cancel-add-storage">Cancel</button>
          <button type="submit" class="btn-action btn-primary" style="width: auto; background-color: #25E2CC; color: #002B3D; border: none; font-weight: 600;">Save Storage Item</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast Notification Center -->
  <div class="toast-container" id="toast-container"></div>

  <script>
    // Lucide Icon activation
    lucide.createIcons();
  </script>
  <script src="app.js?v=<?php echo time(); ?>&t=<?php echo microtime(true); ?>"></script>
</body>
</html>
