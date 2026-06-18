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
  <title>IT Wall to Wall Monitoring System</title>
  <link rel="stylesheet" href="style.v2.css">
  
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
      </div>
    </header>

    <!-- Search & Filters Toolbar Panel -->
    <div class="toolbar-search-filter">
      <div class="toolbar-title">Workspace Inventory Records</div>
      <div class="filter-panel">
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
          <label class="filter-label">Program</label>
          <select class="filter-select" id="select-program">
            <option value="All">All Programs</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">CPU Brand</label>
          <select class="filter-select" id="select-cpu">
            <option value="All">All CPUs</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Monitor Brand</label>
          <select class="filter-select" id="select-monitor">
            <option value="All">All Monitors</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">CPU Serial</label>
          <select class="filter-select" id="select-serial">
            <option value="All">All Serials</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Located Floor</label>
          <select class="filter-select" id="select-floor">
            <option value="All">All Floors</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">CPU Model</label>
          <select class="filter-select" id="select-model">
            <option value="All">All Models</option>
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

    <!-- Main Table Workspace -->
    <main class="table-workspace">
      <table class="table-custom">
        <thead>
          <tr>
            <th data-sort="Station_Number">Station No.<span class="sort-indicator"></span></th>
            <th data-sort="CPU_Model">CPU Model<span class="sort-indicator"></span></th>
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
            <th data-sort="Program">Program<span class="sort-indicator"></span></th>
            <th data-sort="Asset_located_floor">Floor<span class="sort-indicator"></span></th>
            <th data-sort="Site">Site<span class="sort-indicator"></span></th>
            <th data-sort="Current_Status">Status<span class="sort-indicator"></span></th>
            <th data-sort="Created_Date">Created<span class="sort-indicator"></span></th>
            <th data-sort="Modified_Date">Modified<span class="sort-indicator"></span></th>
          </tr>
        </thead>
        <tbody id="assets-table-body">
          <!-- Populated dynamically by JavaScript API fetch -->
        </tbody>
      </table>
      
      <!-- Empty State indicator -->
      <div class="table-empty-state" id="table-empty-message" style="display: none;">
        <i data-lucide="inbox" style="width: 48px; height: 48px; margin: 0 auto;"></i>
        <p>No matching asset records found.</p>
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
            <input type="text" class="modal-input-field" id="add-cpu-model" placeholder="e.g. HP EliteDesk 800 G5">
          </div>
          <div class="form-group">
            <label class="form-label">CPU Serial</label>
            <input type="text" class="modal-input-field" id="add-cpu-serial" placeholder="e.g. 3CQ4210V7V">
          </div>
          <div class="form-group">
            <label class="form-label">CPU Brand</label>
            <input type="text" class="modal-input-field" id="add-cpu-brand" placeholder="e.g. HP">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 1 Model</label>
            <input type="text" class="modal-input-field" id="add-mon1-model" placeholder="e.g. HP P201">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 1 Serial</label>
            <input type="text" class="modal-input-field" id="add-mon1-serial" placeholder="e.g. 6CM3413S1B">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 1 Brand</label>
            <input type="text" class="modal-input-field" id="add-mon1-brand" placeholder="e.g. HP">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 2 Model</label>
            <input type="text" class="modal-input-field" id="add-mon2-model" placeholder="e.g. Samsung S22E390H">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 2 Serial</label>
            <input type="text" class="modal-input-field" id="add-mon2-serial" placeholder="e.g. 0LU4HTKQ100216B">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 2 Brand</label>
            <input type="text" class="modal-input-field" id="add-mon2-brand" placeholder="e.g. Samsung">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 3 Model</label>
            <input type="text" class="modal-input-field" id="add-mon3-model" placeholder="e.g. Dell P2419H">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 3 Serial</label>
            <input type="text" class="modal-input-field" id="add-mon3-serial" placeholder="e.g. CN07F10V5U">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 3 Brand</label>
            <input type="text" class="modal-input-field" id="add-mon3-brand" placeholder="e.g. Dell">
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
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Located Floor</label>
            <input type="text" class="modal-input-field" id="add-floor" placeholder="e.g. 4th">
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
            <input type="text" class="modal-input-field" id="edit-cpu-model">
          </div>
          <div class="form-group">
            <label class="form-label">CPU Serial</label>
            <input type="text" class="modal-input-field" id="edit-cpu-serial">
          </div>
          <div class="form-group">
            <label class="form-label">CPU Brand</label>
            <input type="text" class="modal-input-field" id="edit-cpu-brand">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 1 Model</label>
            <input type="text" class="modal-input-field" id="edit-mon1-model">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 1 Serial</label>
            <input type="text" class="modal-input-field" id="edit-mon1-serial">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 1 Brand</label>
            <input type="text" class="modal-input-field" id="edit-mon1-brand">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 2 Model</label>
            <input type="text" class="modal-input-field" id="edit-mon2-model">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 2 Serial</label>
            <input type="text" class="modal-input-field" id="edit-mon2-serial">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 2 Brand</label>
            <input type="text" class="modal-input-field" id="edit-mon2-brand">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 3 Model</label>
            <input type="text" class="modal-input-field" id="edit-mon3-model">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 3 Serial</label>
            <input type="text" class="modal-input-field" id="edit-mon3-serial">
          </div>
          <div class="form-group">
            <label class="form-label">Monitor 3 Brand</label>
            <input type="text" class="modal-input-field" id="edit-mon3-brand">
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
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Located Floor</label>
            <input type="text" class="modal-input-field" id="edit-floor">
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

  <!-- Toast Notification Center -->
  <div class="toast-container" id="toast-container"></div>

  <script>
    // Lucide Icon activation
    lucide.createIcons();
  </script>
  <script src="app.js"></script>
</body>
</html>
