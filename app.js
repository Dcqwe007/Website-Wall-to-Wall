document.addEventListener('DOMContentLoaded', () => {

  /* ========================================================
     1. TOAST NOTIFICATION SYSTEM
     ======================================================== */
  const toastContainer = document.getElementById('toast-container');

  function showToast(title, message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'danger') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width: 18px; height: 18px; flex-shrink: 0; color: inherit;"></i>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close"><i data-lucide="x" style="width: 14px; height: 14px;"></i></button>
    `;

    toastContainer.appendChild(toast);
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Manual close event
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 400);
    });

    // Auto remove toast
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 400);
      }
    }, 4000);
  }


  /* ========================================================
     2. LOGIN SCREEN CONTROLLER (Connects to api.php)
     ======================================================== */
  const loginForm = document.getElementById('login-form');
  const togglePasswordBtn = document.getElementById('toggle-password-btn');
  const passwordField = document.getElementById('password');

  if (togglePasswordBtn && passwordField) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordField.setAttribute('type', type);

      const icon = togglePasswordBtn.querySelector('i');
      if (icon) {
        if (type === 'text') {
          icon.setAttribute('data-lucide', 'eye-off');
        } else {
          icon.setAttribute('data-lucide', 'eye');
        }
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('email').value.trim();
      const passwordInput = passwordField.value;
      const submitBtn = document.getElementById('btn-login-submit');
      const btnText = submitBtn.querySelector('.btn-text');
      const spinner = submitBtn.querySelector('.spinner');
      const errorAlert = document.getElementById('login-error-alert');
      const errorMessage = document.getElementById('login-error-message');

      errorAlert.style.display = 'none';

      // Trigger loading animation
      btnText.textContent = "Authenticating...";
      spinner.style.display = "block";
      submitBtn.disabled = true;

      // Submit credentials to the XAMPP PHP API
      fetch('api.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Store token client-side for backup checks
            sessionStorage.setItem('aether_session_token', 'active');

            // Trigger the premium full-screen loading transition
            const overlay = document.getElementById('login-loader-overlay');
            const progressBar = document.getElementById('loader-progress-bar');
            const progressPct = document.getElementById('loader-progress-pct');
            const loaderStatus = document.getElementById('loader-status');

            if (overlay && progressBar && progressPct && loaderStatus) {
              overlay.classList.add('active');

              const duration = 4000; // 4.0 seconds animation transition duration
              const startTime = performance.now();

              function animate(now) {
                const elapsed = now - startTime;
                const progress = Math.min((elapsed / duration) * 100, 100);

                progressBar.style.width = `${progress}%`;
                progressPct.textContent = `${Math.round(progress)}%`;

                // Dynamically change loading phase messages based on percentage progress
                if (progress < 25) {
                  loaderStatus.textContent = "Credentials approved. Authenticating session...";
                } else if (progress < 55) {
                  loaderStatus.textContent = "Initializing Concentrix UP 2 IT node...";
                } else if (progress < 85) {
                  loaderStatus.textContent = "Loading asset tracking database records...";
                } else {
                  loaderStatus.textContent = "Redirecting to dashboard portal...";
                }

                if (progress < 100) {
                  requestAnimationFrame(animate);
                } else {
                  setTimeout(() => {
                    window.location.href = 'home.php';
                  }, 150);
                }
              }
              requestAnimationFrame(animate);
            } else {
              // Fallback redirect if elements are missing from the page
              window.location.href = 'home.php';
            }
          } else {
            errorMessage.textContent = data.message || "Incorrect email/username or password.";
            errorAlert.style.display = 'flex';

            btnText.textContent = "Sign In";
            spinner.style.display = "none";
            submitBtn.disabled = false;
          }
        })
        .catch(err => {
          errorMessage.textContent = "Server Connection error. Please check XAMPP services.";
          errorAlert.style.display = 'flex';

          btnText.textContent = "Sign In";
          spinner.style.display = "none";
          submitBtn.disabled = false;
          console.error("Login failure: ", err);
        });
    });

    ['btn-google-login', 'btn-github-login', 'forgot-password-link'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          alert("Demo Sandbox Mode: External links are disabled. Please sign in using your XAMPP users table credentials.");
        });
      }
    });
  }

  /* ========================================================
     2.1 SIGN UP SCREEN CONTROLLER (Connects to api.php)
     ======================================================== */
  const signupForm = document.getElementById('signup-form');
  const toggleSignupPwdBtn = document.getElementById('toggle-signup-pwd-btn');
  const toggleConfirmPwdBtn = document.getElementById('toggle-confirm-pwd-btn');
  const signupPassword = document.getElementById('signup-password');
  const signupConfirmPassword = document.getElementById('signup-confirm-password');

  function setupPasswordToggle(btn, field) {
    if (btn && field) {
      btn.addEventListener('click', () => {
        const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
        field.setAttribute('type', type);

        const icon = btn.querySelector('i');
        if (icon) {
          if (type === 'text') {
            icon.setAttribute('data-lucide', 'eye-off');
          } else {
            icon.setAttribute('data-lucide', 'eye');
          }
          if (window.lucide) window.lucide.createIcons();
        }
      });
    }
  }

  setupPasswordToggle(toggleSignupPwdBtn, signupPassword);
  setupPasswordToggle(toggleConfirmPwdBtn, signupConfirmPassword);

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const usernameInput = document.getElementById('signup-username').value.trim();
      const emailInput = document.getElementById('signup-email').value.trim();
      const passwordInput = signupPassword.value;
      const confirmPasswordInput = signupConfirmPassword.value;

      const submitBtn = document.getElementById('btn-signup-submit');
      const btnText = submitBtn.querySelector('.btn-text');
      const spinner = submitBtn.querySelector('.spinner');

      const errorAlert = document.getElementById('signup-error-alert');
      const errorMessage = document.getElementById('signup-error-message');
      const successAlert = document.getElementById('signup-success-alert');
      const successMessage = document.getElementById('signup-success-message');

      errorAlert.style.display = 'none';
      successAlert.style.display = 'none';

      // Enforce Concentrix SSO email format (fullname.surname@concentrix.com)
      const emailRegex = /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9._-]+@concentrix\.com$/i;
      if (!emailRegex.test(emailInput)) {
        errorMessage.textContent = "Please enter a valid Concentrix SSO email (format: fullname.surname@concentrix.com).";
        errorAlert.style.display = 'flex';
        return;
      }

      // Client-side passwords match validation
      if (passwordInput !== confirmPasswordInput) {
        errorMessage.textContent = "Passwords do not match.";
        errorAlert.style.display = 'flex';
        return;
      }

      // Trigger loading state
      btnText.textContent = "Creating account...";
      spinner.style.display = "block";
      submitBtn.disabled = true;

      // Submit registration payload
      fetch('api.php?action=signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          email: emailInput,
          password: passwordInput,
          confirm_password: confirmPasswordInput
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            successMessage.textContent = "Account created successfully! Redirecting to login...";
            successAlert.style.display = 'flex';

            signupForm.reset();

            setTimeout(() => {
              window.location.href = 'index.php';
            }, 2000);
          } else {
            errorMessage.textContent = data.message || "Failed to create account.";
            errorAlert.style.display = 'flex';

            btnText.textContent = "Register Account";
            spinner.style.display = "none";
            submitBtn.disabled = false;
          }
        })
        .catch(err => {
          errorMessage.textContent = "Server Connection error. Please check XAMPP services.";
          errorAlert.style.display = 'flex';

          btnText.textContent = "Register Account";
          spinner.style.display = "none";
          submitBtn.disabled = false;
          console.error("Signup failure: ", err);
        });
    });
  }


  /* ========================================================
     3. MONITORING SYSTEM DATABASE & CRUD HANDLERS
     ======================================================== */
  const dashboardContainer = document.querySelector('.dashboard-container');

  if (dashboardContainer) {

    // Active UI state
    let assetsList = [];
    let currentFilteredList = []; // Tracks currently visible/filtered rows for CSV export
    let selectedStation = null; // Track row selections by Station_Number (Primary Key)
    const pingStatusCache = {}; // Cache for ping results: { [ip]: { online: boolean, time: string, timestamp: number } }
    let sortColumn = 'Station_Number';
    let sortOrder = 'asc';
    let searchQuery = '';
    let programChart = null; // Chart.js instance for program distribution

    // History states
    let historyList = [];
    let currentFilteredHistory = [];
    let historySortColumn = 'changed_at';
    let historySortOrder = 'desc';
    let historySearchQuery = '';

    // Inventory states
    let inventoryList = [];
    let currentFilteredInventory = [];
    let inventorySortColumn = 'removed_at';
    let inventorySortOrder = 'desc';
    let inventorySearchQuery = '';

    // Multi-faceted Filter States
    let selectedProgram = 'All';
    let selectedCpu = 'All';
    let selectedMonitor = 'All';
    let selectedSerial = 'All';
    let selectedFloor = 'All';
    let selectedModel = 'All';
    let selectedSite = 'All';
    let selectedStatus = 'All';

    // DOM bindings
    const tableBody = document.getElementById('assets-table-body');
    const emptyMessage = document.getElementById('table-empty-message');
    const searchInput = document.getElementById('search-input');
    const statsText = document.getElementById('footer-stats-text');
    const btnDelete = document.getElementById('btn-delete');
    const btnEdit = document.getElementById('btn-edit');
    const btnUpdateStatus = document.getElementById('btn-update-status');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnExportCsv = document.getElementById('btn-export-csv');
    const btnLogout = document.getElementById('btn-logout');

    // Filter Panel and Drawer elements
    const btnToggleFilters = document.getElementById('btn-toggle-filters');
    const filterDrawer = document.getElementById('filter-drawer');
    const btnClearFilters = document.getElementById('btn-clear-filters');
    const activeFilterCount = document.getElementById('active-filter-count');

    // 8 Select Dropdowns
    const selectProgram = document.getElementById('select-program');
    const selectCpu = document.getElementById('select-cpu');
    const selectMonitor = document.getElementById('select-monitor');
    const selectSerial = document.getElementById('select-serial');
    const selectFloor = document.getElementById('select-floor');
    const selectModel = document.getElementById('select-model');
    const selectSite = document.getElementById('select-site');
    const selectStatus = document.getElementById('select-status');

    // Toggle CRUD actions based on selection
    function updateActionButtonStates() {
      const isSelected = selectedStation !== null;
      btnDelete.disabled = !isSelected;
      btnEdit.disabled = !isSelected;
      btnUpdateStatus.disabled = !isSelected;
    }

    // Toggle Filters Drawer open/close
    if (btnToggleFilters && filterDrawer) {
      btnToggleFilters.addEventListener('click', (e) => {
        e.stopPropagation();
        filterDrawer.classList.toggle('open');
      });
      // Prevent closing when clicking inside drawer
      filterDrawer.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Dynamic Filter Badge Count updater
    function updateActiveFilterBadge() {
      let count = 0;
      if (selectedProgram !== 'All') count++;
      if (selectedCpu !== 'All') count++;
      if (selectedMonitor !== 'All') count++;
      if (selectedSerial !== 'All') count++;
      if (selectedFloor !== 'All') count++;
      if (selectedModel !== 'All') count++;
      if (selectedSite !== 'All') count++;
      if (selectedStatus !== 'All') count++;

      if (activeFilterCount) {
        if (count > 0) {
          activeFilterCount.textContent = count;
          activeFilterCount.style.display = 'inline-flex';
        } else {
          activeFilterCount.style.display = 'none';
        }
      }
    }

    // Rebuild all filter dropdowns based on active database records dynamically
    function populateFilterDropdowns() {
      function populateDropdown(selectEl, keyOrFn, defaultLabel, prevVal) {
        if (!selectEl) return 'All';

        let values = [];
        if (typeof keyOrFn === 'function') {
          values = keyOrFn(assetsList);
        } else {
          values = [...new Set(assetsList.map(a => a[keyOrFn]).filter(v => v !== null && v !== undefined && v.toString().trim() !== ''))];
        }

        // Sort unique values
        values.sort((a, b) => a.toString().localeCompare(b.toString(), undefined, { numeric: true, sensitivity: 'base' }));

        selectEl.innerHTML = `<option value="All">${defaultLabel}</option>`;
        values.forEach(val => {
          const opt = document.createElement('option');
          opt.value = val;
          opt.textContent = val;
          selectEl.appendChild(opt);
        });

        if (values.includes(prevVal)) {
          selectEl.value = prevVal;
          return prevVal;
        } else {
          selectEl.value = 'All';
          return 'All';
        }
      }

      // Populate each of the 8 dropdowns dynamically
      selectedProgram = populateDropdown(selectProgram, 'Program', 'All Programs', selectedProgram);
      selectedCpu = populateDropdown(selectCpu, 'CPU_Brand', 'All CPUs', selectedCpu);

      // Monitor brand is aggregated across Monitor 1, 2, and 3
      selectedMonitor = populateDropdown(selectMonitor, (list) => {
        const brands = [];
        list.forEach(a => {
          if (a.Monitor1_Brand && a.Monitor1_Brand.trim() !== '') brands.push(a.Monitor1_Brand.trim());
          if (a.Monitor2_Brand && a.Monitor2_Brand.trim() !== '') brands.push(a.Monitor2_Brand.trim());
          if (a.Monitor3_Brand && a.Monitor3_Brand.trim() !== '') brands.push(a.Monitor3_Brand.trim());
        });
        return [...new Set(brands)];
      }, 'All Monitors', selectedMonitor);

      selectedSerial = populateDropdown(selectSerial, 'CPU_Serial', 'All Serials', selectedSerial);
      selectedFloor = populateDropdown(selectFloor, 'Asset_located_floor', 'All Floors', selectedFloor);
      selectedModel = populateDropdown(selectModel, 'CPU_Model', 'All Models', selectedModel);
      selectedSite = populateDropdown(selectSite, 'Site', 'All Sites', selectedSite);
      selectedStatus = populateDropdown(selectStatus, 'Current_Status', 'All Statuses', selectedStatus);

      updateActiveFilterBadge();
    }

    // Dynamically sync edit and add modal program options with custom values in the database
    function syncProgramDropdowns() {
      const addProgramSelect = document.getElementById('add-program');
      const editProgramSelect = document.getElementById('edit-program');
      if (!addProgramSelect || !editProgramSelect) return;

      // Extract unique non-empty program values from assetsList
      const dbPrograms = [...new Set(assetsList.map(a => a.Program).filter(p => p && p.trim() !== ''))];

      const updateSelectOptions = (selectEl) => {
        const existingValues = Array.from(selectEl.options).map(opt => opt.value);
        dbPrograms.forEach(prog => {
          if (!existingValues.includes(prog)) {
            const opt = document.createElement('option');
            opt.value = prog;
            opt.textContent = prog;
            selectEl.appendChild(opt);
          }
        });
      };

      updateSelectOptions(addProgramSelect);
      updateSelectOptions(editProgramSelect);
    }

    // Load assets from database API
    function fetchAssetsFromDatabase() {
      fetch('api.php?action=fetch')
        .then(res => {
          if (!res.ok) throw new Error("Unauthorized or server connection failure");
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
            populateFilterDropdowns();
            syncProgramDropdowns();
            renderTable();
          } else {
            showToast("Fetch Error", res.message || "Failed to fetch assets.", "danger");
          }
        })
        .catch(err => {
          showToast("System Connection Error", "Could not connect to database API. Check XAMPP MySQL.", "danger");
          console.error(err);
        });
    }

    // Load edit history from database API
    function fetchHistoryFromDatabase() {
      fetch('api.php?action=history')
        .then(res => {
          if (!res.ok) throw new Error("Unauthorized or server connection failure");
          return res.json();
        })
        .then(res => {
          if (res.success) {
            historyList = res.data || [];
            renderHistoryTable();
          } else {
            showToast("Fetch Error", res.message || "Failed to fetch edit history.", "danger");
          }
        })
        .catch(err => {
          showToast("System Connection Error", "Could not connect to database API. Check XAMPP MySQL.", "danger");
          console.error(err);
        });
    }

    // Render edit history table
    function renderHistoryTable() {
      const historyTableBody = document.getElementById('history-table-body');
      const emptyMessage = document.getElementById('table-empty-message');
      const emptyMessageText = document.getElementById('empty-message-text');
      
      if (!historyTableBody) return;
      historyTableBody.innerHTML = '';

      // Client side filters (Search history input)
      let filtered = historyList.filter(item => {
        if (historySearchQuery) {
          const matchParts = [
            item.changed_at,
            item.station_number === 0 ? 'global' : item.station_number,
            item.action_type,
            item.username,
            item.details
          ];
          const matchStr = matchParts.map(val => (val !== null && val !== undefined) ? val.toString().toLowerCase() : '').join(' ');
          return matchStr.includes(historySearchQuery);
        }
        return true;
      });

      // Client side sorting
      filtered.sort((a, b) => {
        let valA = a[historySortColumn];
        let valB = b[historySortColumn];

        if (historySortColumn === 'station_number') {
          valA = parseInt(valA) || 0;
          valB = parseInt(valB) || 0;
        } else {
          valA = (valA || '').toString().toLowerCase();
          valB = (valB || '').toString().toLowerCase();
        }

        if (valA < valB) return historySortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return historySortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      currentFilteredHistory = filtered;

      // Render rows
      if (filtered.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'block';
        if (emptyMessageText) emptyMessageText.textContent = "No history records found.";
      } else {
        if (emptyMessage) emptyMessage.style.display = 'none';

        filtered.forEach(item => {
          const tr = document.createElement('tr');
          
          let badgeClass = 'badge-other';
          if (item.action_type === 'Add') badgeClass = 'badge-deployed';
          else if (item.action_type === 'Edit') badgeClass = 'badge-onsite';
          else if (item.action_type === 'Delete') badgeClass = 'badge-pulled';
          else if (item.action_type === 'Status Update' || item.action_type === 'Reset') badgeClass = 'badge-other';

          // Format MySQL date and time to a human-readable format
          let displayDate = item.changed_at;
          try {
            const dateObj = new Date(item.changed_at.replace(/-/g, '/'));
            if (!isNaN(dateObj.getTime())) {
              displayDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
            }
          } catch (e) {
            // Keep original if error
          }

          tr.innerHTML = `
            <td style="font-family: monospace; font-size: 12.5px;">${displayDate}</td>
            <td><strong>${item.station_number === 0 ? 'Global / System' : 'Station ' + item.station_number}</strong></td>
            <td><span class="badge ${badgeClass}">${item.action_type}</span></td>
            <td><span style="font-weight: 500;">${item.username || '-'}</span></td>
            <td style="white-space: normal; max-width: 450px; font-size: 11.5px; line-height: 1.4;">${item.details || '-'}</td>
          `;

          historyTableBody.appendChild(tr);
        });
      }

      // Update footer stats
      if (statsText) {
        statsText.innerHTML = `Total History Records: <strong>${historyList.length}</strong> | Visible: <strong>${filtered.length}</strong>`;
      }
    }

    // Export Edit History to CSV
    function exportHistoryCSV() {
      const listToExport = currentFilteredHistory.length > 0 ? currentFilteredHistory : historyList;

      if (listToExport.length === 0) {
        showToast("Export Failed", "There are no history records to download.", "danger");
        return;
      }

      const headers = ["ID", "Changed At", "Station Number", "Action Type", "Operator", "Details"];
      let csvContent = headers.join(",") + "\r\n";

      listToExport.forEach(item => {
        const row = [
          item.id,
          item.changed_at,
          item.station_number === 0 ? 'Global' : item.station_number,
          item.action_type,
          item.username || '',
          item.details || ''
        ].map(val => {
          let str = (val !== null && val !== undefined) ? val.toString().replace(/"/g, '""') : '';
          if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
            str = `"${str}"`;
          }
          return str;
        });
        csvContent += row.join(",") + "\r\n";
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "it_wall_to_wall_history_export.csv");
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("CSV Compiled", "Download for 'it_wall_to_wall_history_export.csv' has started.", "success");
    }

    // Load replaced hardware inventory from database API
    function fetchInventoryFromDatabase() {
      fetch('api.php?action=inventory')
        .then(res => {
          if (!res.ok) throw new Error("Unauthorized or server connection failure");
          return res.json();
        })
        .then(res => {
          if (res.success) {
            inventoryList = res.data || [];
            renderInventoryTable();
          } else {
            showToast("Fetch Error", res.message || "Failed to fetch hardware inventory.", "danger");
          }
        })
        .catch(err => {
          showToast("System Connection Error", "Could not connect to database API. Check XAMPP MySQL.", "danger");
          console.error(err);
        });
    }

    // Render hardware inventory table
    function renderInventoryTable() {
      const inventoryTableBody = document.getElementById('inventory-table-body');
      const emptyMessage = document.getElementById('table-empty-message');
      const emptyMessageText = document.getElementById('empty-message-text');
      
      if (!inventoryTableBody) return;
      inventoryTableBody.innerHTML = '';

      // Client side filters (Search inventory input)
      let filtered = inventoryList.filter(item => {
        if (inventorySearchQuery) {
          const matchParts = [
            item.removed_at,
            item.asset_type,
            item.model,
            item.serial_number,
            item.brand,
            item.previous_station,
            item.username,
            item.status
          ];
          const matchStr = matchParts.map(val => (val !== null && val !== undefined) ? val.toString().toLowerCase() : '').join(' ');
          return matchStr.includes(inventorySearchQuery);
        }
        return true;
      });

      // Client side sorting
      filtered.sort((a, b) => {
        let valA = a[inventorySortColumn];
        let valB = b[inventorySortColumn];

        if (inventorySortColumn === 'previous_station' || inventorySortColumn === 'id') {
          valA = parseInt(valA) || 0;
          valB = parseInt(valB) || 0;
        } else {
          valA = (valA || '').toString().toLowerCase();
          valB = (valB || '').toString().toLowerCase();
        }

        if (valA < valB) return inventorySortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return inventorySortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      currentFilteredInventory = filtered;

      // Render rows
      if (filtered.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'block';
        if (emptyMessageText) emptyMessageText.textContent = "No inventory items found.";
      } else {
        if (emptyMessage) emptyMessage.style.display = 'none';

        filtered.forEach(item => {
          const tr = document.createElement('tr');

          let badgeClass = 'badge-other';
          if (item.status === 'On Inventory') badgeClass = 'badge-deployed';
          else if (item.status === 'In Stock') badgeClass = 'badge-onsite';
          else if (item.status === 'Scrapped') badgeClass = 'badge-pulled';

          // Format date
          let displayDate = item.removed_at;
          try {
            const dateObj = new Date(item.removed_at.replace(/-/g, '/'));
            if (!isNaN(dateObj.getTime())) {
              displayDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
            }
          } catch (e) {}

          let displayAssetType = item.asset_type;
          if (displayAssetType && displayAssetType.startsWith('Monitor')) {
            displayAssetType = 'Monitor';
          }

          tr.innerHTML = `
            <td style="font-family: monospace; font-size: 12.5px;">${displayDate}</td>
            <td>Station ${item.previous_station}</td>
            <td><strong>${displayAssetType}</strong></td>
            <td>${item.brand || '-'}</td>
            <td style="font-family: monospace; font-size: 12px; font-weight: 600;">${item.serial_number}</td>
            <td>${item.username || 'System'}</td>
            <td><span class="badge ${badgeClass}">${item.status}</span></td>
            <td>
              <button class="btn-scrap-inventory" data-id="${item.id}" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); cursor: pointer; color: #EF4444; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 11px; transition: all 0.15s ease;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'">
                Scrap
              </button>
            </td>
          `;

          // Bind scrap action
          const scrapBtn = tr.querySelector('.btn-scrap-inventory');
          if (scrapBtn) {
            scrapBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const id = scrapBtn.getAttribute('data-id');
              if (confirm("Are you sure you want to permanently delete/scrap this item from the inventory?")) {
                fetch('api.php?action=delete_inventory', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: parseInt(id) })
                })
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    showToast("Asset Scrapped", "Item removed from inventory.", "success");
                    fetchInventoryFromDatabase();
                  } else {
                    showToast("Action Failed", "Could not remove item.", "danger");
                  }
                })
                .catch(err => {
                  showToast("Server Connection Error", "Check XAMPP connection.", "danger");
                  console.error(err);
                });
              }
            });
          }

          inventoryTableBody.appendChild(tr);
        });
      }

      // Update stats text
      if (statsText) {
        statsText.innerHTML = `Total Inventory Items: <strong>${inventoryList.length}</strong> | Visible: <strong>${filtered.length}</strong>`;
      }
    }

    // Export Inventory list to CSV
    function exportInventoryCSV() {
      const listToExport = currentFilteredInventory.length > 0 ? currentFilteredInventory : inventoryList;

      if (listToExport.length === 0) {
        showToast("Export Failed", "There are no inventory items to download.", "danger");
        return;
      }

      const headers = ["ID", "Date Changed", "Station No.", "Asset Type", "Brand", "Serial Number", "Operator", "Status"];
      let csvContent = headers.join(",") + "\r\n";

      listToExport.forEach(item => {
        let displayAssetType = item.asset_type;
        if (displayAssetType && displayAssetType.startsWith('Monitor')) {
          displayAssetType = 'Monitor';
        }
        const row = [
          item.id,
          item.removed_at,
          item.previous_station,
          displayAssetType,
          item.brand || '',
          item.serial_number,
          item.username || 'System',
          item.status
        ].map(val => {
          let str = (val !== null && val !== undefined) ? val.toString().replace(/"/g, '""') : '';
          if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
            str = `"${str}"`;
          }
          return str;
        });
        csvContent += row.join(",") + "\r\n";
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "it_wall_to_wall_inventory_export.csv");
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("CSV Compiled", "Download for 'it_wall_to_wall_inventory_export.csv' has started.", "success");
    }

    /* ========================================================
       RENDER AND FILTER TABLE (Enterprise DataGridView Style)
       ======================================================== */
    function renderTable() {
      tableBody.innerHTML = '';

      // 1. Client side filters (Search input & 8 dynamic dropdown filters)
      let filtered = assetsList.filter(asset => {
        if (selectedProgram !== 'All' && asset.Program !== selectedProgram) return false;
        if (selectedCpu !== 'All' && asset.CPU_Brand !== selectedCpu) return false;

        if (selectedMonitor !== 'All' &&
          asset.Monitor1_Brand !== selectedMonitor &&
          asset.Monitor2_Brand !== selectedMonitor &&
          asset.Monitor3_Brand !== selectedMonitor) {
          return false;
        }

        if (selectedSerial !== 'All' && asset.CPU_Serial !== selectedSerial) return false;
        if (selectedFloor !== 'All' && asset.Asset_located_floor !== selectedFloor) return false;
        if (selectedModel !== 'All' && asset.CPU_Model !== selectedModel) return false;
        if (selectedSite !== 'All' && asset.Site !== selectedSite) return false;
        if (selectedStatus !== 'All' && asset.Current_Status !== selectedStatus) return false;

        if (searchQuery) {
          const matchParts = [
            asset.Station_Number,
            asset.CPU_Model,
            asset.CPU_Serial,
            asset.CPU_Brand,
            asset.Monitor1_Model,
            asset.Monitor1_Serial,
            asset.Monitor1_Brand,
            asset.Monitor2_Model,
            asset.Monitor2_Serial,
            asset.Monitor2_Brand,
            asset.Monitor3_Model,
            asset.Monitor3_Serial,
            asset.Monitor3_Brand,
            asset.Program,
            asset.Asset_located_floor,
            asset.Site,
            asset.Current_Status,
            asset.Hostname,
            asset.Created_Date,
            asset.Modified_Date
          ];
          const matchStr = matchParts.map(val => (val !== null && val !== undefined) ? val.toString().toLowerCase() : '').join(' ');
          return matchStr.includes(searchQuery);
        }

        return true;
      });

      // 2. Client side sorting
      filtered.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        if (sortColumn === 'Station_Number') {
          valA = parseInt(valA) || 0;
          valB = parseInt(valB) || 0;
        } else {
          valA = (valA || '').toString().toLowerCase();
          valB = (valB || '').toString().toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      currentFilteredList = filtered;

      // 3. Render rows
      if (filtered.length === 0) {
        emptyMessage.style.display = 'block';
      } else {
        emptyMessage.style.display = 'none';

        filtered.forEach((asset, index) => {
          const tr = document.createElement('tr');
          tr.setAttribute('data-station', asset.Station_Number);

          if (selectedStation == asset.Station_Number) {
            tr.classList.add('selected');
          }

          // Badge coloring
          let badgeClass = 'badge-other';
          if (asset.Current_Status === 'Onsite Deployed') badgeClass = 'badge-onsite';
          else if (asset.Current_Status === 'Pulled Out') badgeClass = 'badge-pulled';

          tr.innerHTML = `
            <td class="cpu-ping-visible"><strong>${asset.Station_Number}</strong></td>
            <td class="cpu-ping-visible">${asset.CPU_Model || '-'}</td>
            <td style="font-family: monospace; font-size: 12px;">${asset.CPU_Serial || '-'}</td>
            <td>${asset.CPU_Brand || '-'}</td>
            <td class="cpu-ping-visible hostname-column">
              ${asset.Hostname ? `<span style="font-family: monospace; font-size: 12px; font-weight: 500;">${asset.Hostname}</span>` : '<span style="color: #9CA3AF;">-</span>'}
            </td>
            <td>${asset.Monitor1_Model || '-'}</td>
            <td style="font-family: monospace; font-size: 12px;">${asset.Monitor1_Serial || '-'}</td>
            <td>${asset.Monitor1_Brand || '-'}</td>
            <td>${asset.Monitor2_Model || '-'}</td>
            <td style="font-family: monospace; font-size: 12px;">${asset.Monitor2_Serial || '-'}</td>
            <td>${asset.Monitor2_Brand || '-'}</td>
            <td>${asset.Monitor3_Model || '-'}</td>
            <td style="font-family: monospace; font-size: 12px;">${asset.Monitor3_Serial || '-'}</td>
            <td>${asset.Monitor3_Brand || '-'}</td>
            <td class="cpu-ping-visible">${asset.Program || '-'}</td>
            <td class="cpu-ping-visible">${asset.Asset_located_floor || '-'}</td>
            <td class="cpu-ping-visible">${asset.Site || '-'}</td>
            <td><span class="badge ${badgeClass}">${asset.Current_Status}</span></td>
            <td style="font-size: 11px; opacity: 0.75;">${asset.Created_Date || '-'}</td>
            <td style="font-size: 11px; color: #22D3EE; font-weight: 600;">${asset.Modified_Date || '-'}</td>
          `;

          // Row click selection by Station_Number
          tr.addEventListener('click', (e) => {
            e.stopPropagation();
            if (selectedStation == asset.Station_Number) {
              selectedStation = null;
            } else {
              selectedStation = asset.Station_Number;
            }
            renderTable();
          });

          tableBody.appendChild(tr);
        });
      }

      // Update counters
      const activeObj = assetsList.find(a => a.Station_Number == selectedStation);
      const selectedText = activeObj ? `Station ${activeObj.Station_Number}` : 'None';
      const countOnsite = assetsList.filter(a => a.Current_Status === 'Onsite Deployed').length;
      const countPulled = assetsList.filter(a => a.Current_Status === 'Pulled Out').length;

      statsText.innerHTML = `Total Assets: <strong>${assetsList.length}</strong> | Onsite Deployed: <strong>${countOnsite}</strong> | Pulled Out: <strong>${countPulled}</strong> | Visible: <strong>${filtered.length}</strong> | Selected: <strong>${selectedText}</strong>`;

      updateActionButtonStates();
    }

    // Grid column sorting — data-sort values already match DB column names directly
    document.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const dbCol = th.getAttribute('data-sort');

        document.querySelectorAll('th').forEach(header => {
          header.classList.remove('sorted-asc', 'sorted-desc');
        });

        if (sortColumn === dbCol) {
          sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          sortColumn = dbCol;
          sortOrder = 'asc';
        }

        th.classList.add(sortOrder === 'asc' ? 'sorted-asc' : 'sorted-desc');
        renderTable();
      });
    });

    // Clear selection when clicking table workspace background
    document.querySelector('.table-workspace').addEventListener('click', () => {
      if (selectedStation !== null) {
        selectedStation = null;
        renderTable();
      }
    });

    // Search input event binding
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderTable();
      });
    }

    // Bind change events to all 8 dropdown selects
    const filterConfig = [
      { element: selectProgram, stateSetter: val => { selectedProgram = val; } },
      { element: selectCpu, stateSetter: val => { selectedCpu = val; } },
      { element: selectMonitor, stateSetter: val => { selectedMonitor = val; } },
      { element: selectSerial, stateSetter: val => { selectedSerial = val; } },
      { element: selectFloor, stateSetter: val => { selectedFloor = val; } },
      { element: selectModel, stateSetter: val => { selectedModel = val; } },
      { element: selectSite, stateSetter: val => { selectedSite = val; } },
      { element: selectStatus, stateSetter: val => { selectedStatus = val; } }
    ];

    filterConfig.forEach(cfg => {
      if (cfg.element) {
        cfg.element.addEventListener('change', (e) => {
          cfg.stateSetter(e.target.value);
          updateActiveFilterBadge();
          renderTable();
        });
      }
    });

    // Clear all filters button event binding
    if (btnClearFilters) {
      btnClearFilters.addEventListener('click', () => {
        selectedProgram = 'All';
        selectedCpu = 'All';
        selectedMonitor = 'All';
        selectedSerial = 'All';
        selectedFloor = 'All';
        selectedModel = 'All';
        selectedSite = 'All';
        selectedStatus = 'All';

        if (selectProgram) selectProgram.value = 'All';
        if (selectCpu) selectCpu.value = 'All';
        if (selectMonitor) selectMonitor.value = 'All';
        if (selectSerial) selectSerial.value = 'All';
        if (selectFloor) selectFloor.value = 'All';
        if (selectModel) selectModel.value = 'All';
        if (selectSite) selectSite.value = 'All';
        if (selectStatus) selectStatus.value = 'All';

        updateActiveFilterBadge();
        renderTable();
        showToast("Filters Cleared", "Workspace filtering has been reset.", "info");
      });
    }


    /* ========================================================
       4. MODALS AND FORM ACTIONS (Calls api.php)
       ======================================================== */
    const modalAdd = document.getElementById('modal-add');
    const modalEdit = document.getElementById('modal-edit');
    const modalStatus = document.getElementById('modal-status');
    const modalDelete = document.getElementById('modal-delete');

    function openModal(modal) { modal.classList.add('open'); }
    function closeModal(modal) { modal.classList.remove('open'); }

    function setupModalClose(modal, closeBtnId, cancelBtnId) {
      const closeBtn = document.getElementById(closeBtnId);
      const cancelBtn = document.getElementById(cancelBtnId);

      if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
      if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal(modal));

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }

    setupModalClose(modalAdd, 'btn-close-add', 'btn-cancel-add');
    setupModalClose(modalEdit, 'btn-close-edit', 'btn-cancel-edit');
    setupModalClose(modalStatus, 'btn-close-status', 'btn-cancel-status');
    setupModalClose(modalDelete, 'btn-close-delete-modal', 'btn-cancel-delete-modal');

    // Trigger Add Modal
    document.getElementById('btn-add').addEventListener('click', () => {
      document.getElementById('form-add-asset').reset();
      openModal(modalAdd);
    });

    // Handle Add Asset
    document.getElementById('form-add-asset').addEventListener('submit', (e) => {
      e.preventDefault();

      const payload = {
        Station_Number: parseInt(document.getElementById('add-station').value) || 0,
        CPU_Model: document.getElementById('add-cpu-model').value.trim(),
        CPU_Serial: document.getElementById('add-cpu-serial').value.trim(),
        CPU_Brand: document.getElementById('add-cpu-brand').value.trim(),
        Monitor1_Model: document.getElementById('add-mon1-model').value.trim(),
        Monitor1_Serial: document.getElementById('add-mon1-serial').value.trim(),
        Monitor1_Brand: document.getElementById('add-mon1-brand').value.trim(),
        Monitor2_Model: document.getElementById('add-mon2-model').value.trim(),
        Monitor2_Serial: document.getElementById('add-mon2-serial').value.trim(),
        Monitor2_Brand: document.getElementById('add-mon2-brand').value.trim(),
        Monitor3_Model: document.getElementById('add-mon3-model').value.trim(),
        Monitor3_Serial: document.getElementById('add-mon3-serial').value.trim(),
        Monitor3_Brand: document.getElementById('add-mon3-brand').value.trim(),
        Program: document.getElementById('add-program').value,
        Asset_located_floor: document.getElementById('add-floor').value.trim(),
        Site: document.getElementById('add-site').value.trim(),
        Current_Status: document.getElementById('add-status').value,
        Hostname: document.getElementById('add-hostname').value.trim()
      };

      fetch('api.php?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            closeModal(modalAdd);
            fetchAssetsFromDatabase();
            showToast("Asset Cataloged", `Station ${payload.Station_Number} written to database.`, "success");
          } else {
            showToast("Database Validation Failed", data.message || "Could not write record.", "danger");
          }
        })
        .catch(err => {
          showToast("Server Connection Error", "Check XAMPP services.", "danger");
          console.error(err);
        });
    });

    // Trigger Edit Modal
    btnEdit.addEventListener('click', () => {
      const asset = assetsList.find(a => a.Station_Number == selectedStation);
      if (!asset) return;

      document.getElementById('edit-station-key').value = asset.Station_Number;
      document.getElementById('edit-station').value = asset.Station_Number;
      document.getElementById('edit-cpu-model').value = asset.CPU_Model || '';
      document.getElementById('edit-cpu-serial').value = asset.CPU_Serial || '';
      document.getElementById('edit-cpu-brand').value = asset.CPU_Brand || '';
      document.getElementById('edit-hostname').value = asset.Hostname || '';
      document.getElementById('edit-mon1-model').value = asset.Monitor1_Model || '';
      document.getElementById('edit-mon1-serial').value = asset.Monitor1_Serial || '';
      document.getElementById('edit-mon1-brand').value = asset.Monitor1_Brand || '';
      document.getElementById('edit-mon2-model').value = asset.Monitor2_Model || '';
      document.getElementById('edit-mon2-serial').value = asset.Monitor2_Serial || '';
      document.getElementById('edit-mon2-brand').value = asset.Monitor2_Brand || '';
      document.getElementById('edit-mon3-model').value = asset.Monitor3_Model || '';
      document.getElementById('edit-mon3-serial').value = asset.Monitor3_Serial || '';
      document.getElementById('edit-mon3-brand').value = asset.Monitor3_Brand || '';
      document.getElementById('edit-program').value = asset.Program || '';
      document.getElementById('edit-floor').value = asset.Asset_located_floor || '';
      document.getElementById('edit-site').value = asset.Site || '';
      document.getElementById('edit-status').value = asset.Current_Status || 'Deployed';

      openModal(modalEdit);
    });

    // Handle Edit Asset
    document.getElementById('form-edit-asset').addEventListener('submit', (e) => {
      e.preventDefault();

      const oldStation = document.getElementById('edit-station-key').value;
      const payload = {
        old_Station_Number: parseInt(oldStation),
        Station_Number: parseInt(document.getElementById('edit-station').value) || 0,
        CPU_Model: document.getElementById('edit-cpu-model').value.trim(),
        CPU_Serial: document.getElementById('edit-cpu-serial').value.trim(),
        CPU_Brand: document.getElementById('edit-cpu-brand').value.trim(),
        Monitor1_Model: document.getElementById('edit-mon1-model').value.trim(),
        Monitor1_Serial: document.getElementById('edit-mon1-serial').value.trim(),
        Monitor1_Brand: document.getElementById('edit-mon1-brand').value.trim(),
        Monitor2_Model: document.getElementById('edit-mon2-model').value.trim(),
        Monitor2_Serial: document.getElementById('edit-mon2-serial').value.trim(),
        Monitor2_Brand: document.getElementById('edit-mon2-brand').value.trim(),
        Monitor3_Model: document.getElementById('edit-mon3-model').value.trim(),
        Monitor3_Serial: document.getElementById('edit-mon3-serial').value.trim(),
        Monitor3_Brand: document.getElementById('edit-mon3-brand').value.trim(),
        Program: document.getElementById('edit-program').value,
        Asset_located_floor: document.getElementById('edit-floor').value.trim(),
        Site: document.getElementById('edit-site').value.trim(),
        Current_Status: document.getElementById('edit-status').value,
        Hostname: document.getElementById('edit-hostname').value.trim()
      };

      fetch('api.php?action=edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            selectedStation = payload.Station_Number;
            closeModal(modalEdit);
            fetchAssetsFromDatabase();
            showToast("Asset Updated", `Station ${payload.Station_Number} updated successfully.`, "success");
          } else {
            showToast("Database Validation Failed", data.message || "Could not update record.", "danger");
          }
        })
        .catch(err => {
          showToast("Server Connection Error", "Check XAMPP services.", "danger");
          console.error(err);
        });
    });

    // Trigger Status Quick Modal
    btnUpdateStatus.addEventListener('click', () => {
      const asset = assetsList.find(a => a.Station_Number == selectedStation);
      if (!asset) return;

      document.getElementById('quick-status-select').value = asset.Current_Status;
      openModal(modalStatus);
    });

    // Handle Status Quick Update
    document.getElementById('form-update-status').addEventListener('submit', (e) => {
      e.preventDefault();

      const newStatus = document.getElementById('quick-status-select').value;

      fetch('api.php?action=status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Station_Number: selectedStation, Current_Status: newStatus })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            closeModal(modalStatus);
            fetchAssetsFromDatabase();
            showToast("Status Transitioned", `Status is now: ${newStatus}`, "success");
          } else {
            showToast("Status Update Failed", data.message || "Database update failed.", "danger");
          }
        })
        .catch(err => {
          showToast("Server Connection Error", "Check XAMPP services.", "danger");
          console.error(err);
        });
    });

    // Trigger Delete Confirmation Modal
    btnDelete.addEventListener('click', () => {
      if (selectedStation === null) return;
      document.getElementById('delete-asset-serial-label').textContent = `Station ${selectedStation}`;
      openModal(modalDelete);
    });

    // Handle Confirm Delete Button Click inside Modal
    document.getElementById('btn-confirm-delete').addEventListener('click', () => {
      if (selectedStation === null) return;

      fetch('api.php?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Station_Number: selectedStation })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const deleted = selectedStation;
            selectedStation = null;
            closeModal(modalDelete);
            fetchAssetsFromDatabase();
            showToast("Asset Purged", `Station ${deleted} deleted from database.`, "danger");
          } else {
            showToast("Deletion Failed", data.message || "Database execution failed.", "danger");
          }
        })
        .catch(err => {
          showToast("Server Connection Error", "Check XAMPP services.", "danger");
          console.error(err);
        });
    });


    /* ========================================================
       5. FOOTER CONTROL ACTIONS (REFRESH, CSV EXPORT, LOGOUT)
       ======================================================== */

    // Refresh / reload data from the database
    btnRefresh.addEventListener('click', () => {
      const icon = document.getElementById('refresh-icon');
      if (icon) icon.classList.add('rotating');

      if (isHistoryView) {
        historySearchQuery = '';
        const historySearchInput = document.getElementById('history-search-input');
        if (historySearchInput) historySearchInput.value = '';

        fetch('api.php?action=history')
          .then(res => {
            if (!res.ok) throw new Error("Unauthorized or server connection failure");
            return res.json();
          })
          .then(res => {
            setTimeout(() => {
              if (icon) icon.classList.remove('rotating');
              if (res.success) {
                historyList = res.data || [];
                renderHistoryTable();
                showToast("History Refreshed", "Modification logs loaded from database.", "info");
              } else {
                showToast("Fetch Error", res.message || "Failed to fetch edit history.", "danger");
              }
            }, 600);
          })
          .catch(err => {
            if (icon) icon.classList.remove('rotating');
            showToast("Server Connection Error", "Check XAMPP services.", "danger");
            console.error(err);
          });
        return;
      }

      // Clear selections and all filters on refresh
      selectedStation = null;
      searchQuery = '';
      selectedProgram = 'All';
      selectedCpu = 'All';
      selectedMonitor = 'All';
      selectedSerial = 'All';
      selectedFloor = 'All';
      selectedModel = 'All';
      selectedSite = 'All';
      selectedStatus = 'All';

      if (searchInput) searchInput.value = '';
      if (selectProgram) selectProgram.value = 'All';
      if (selectCpu) selectCpu.value = 'All';
      if (selectMonitor) selectMonitor.value = 'All';
      if (selectSerial) selectSerial.value = 'All';
      if (selectFloor) selectFloor.value = 'All';
      if (selectModel) selectModel.value = 'All';
      if (selectSite) selectSite.value = 'All';
      if (selectStatus) selectStatus.value = 'All';

      updateActiveFilterBadge();

      // Fetch the latest data from the database without resetting/wiping it
      fetch('api.php?action=fetch')
        .then(res => {
          if (!res.ok) throw new Error("Unauthorized or server connection failure");
          return res.json();
        })
        .then(res => {
          setTimeout(() => {
            if (icon) icon.classList.remove('rotating');
            if (res.success) {
              assetsList = res.data || [];
              assetsList.forEach(a => {
                if (a.Current_Status === 'Deployed') {
                  a.Current_Status = 'Onsite Deployed';
                }
              });
              populateFilterDropdowns();
              renderTable();
              showToast("Data Refreshed", "Asset records loaded from database.", "info");
            } else {
              showToast("Fetch Error", res.message || "Failed to fetch assets.", "danger");
            }
          }, 600);
        })
        .catch(err => {
          if (icon) icon.classList.remove('rotating');
          showToast("Server Connection Error", "Check XAMPP services.", "danger");
          console.error(err);
        });
    });

    // Export CSV from active table array
    btnExportCsv.addEventListener('click', () => {
      const listToExport = currentFilteredList.length > 0 ? currentFilteredList : assetsList;

      if (listToExport.length === 0) {
        showToast("Export Failed", "There are no records to download.", "danger");
        return;
      }

      // Headers matching the new schema
      const headers = [
        "Station_Number", "CPU_Model", "CPU_Serial", "CPU_Brand", "Hostname",
        "Monitor1_Model", "Monitor1_Serial", "Monitor1_Brand",
        "Monitor2_Model", "Monitor2_Serial", "Monitor2_Brand",
        "Monitor3_Model", "Monitor3_Serial", "Monitor3_Brand",
        "Program", "Asset_located_floor", "Site", "Current_Status",
        "Created_Date", "Modified_Date"
      ];

      let csvContent = "";
      csvContent += headers.join(",") + "\r\n";

      listToExport.forEach(asset => {
        const row = [
          asset.Station_Number,
          asset.CPU_Model || '',
          asset.CPU_Serial || '',
          asset.CPU_Brand || '',
          asset.Hostname || '',
          asset.Monitor1_Model || '',
          asset.Monitor1_Serial || '',
          asset.Monitor1_Brand || '',
          asset.Monitor2_Model || '',
          asset.Monitor2_Serial || '',
          asset.Monitor2_Brand || '',
          asset.Monitor3_Model || '',
          asset.Monitor3_Serial || '',
          asset.Monitor3_Brand || '',
          asset.Program || '',
          asset.Asset_located_floor || '',
          asset.Site || '',
          asset.Current_Status || '',
          asset.Created_Date || '',
          asset.Modified_Date || ''
        ].map(val => {
          let str = (val !== null && val !== undefined) ? val.toString().replace(/"/g, '""') : '';
          if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
            str = `"${str}"`;
          }
          return str;
        });
        csvContent += row.join(",") + "\r\n";
      });

      // Create Blob instead of data URI to prevent encoding errors on special characters (e.g. #, %)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "it_wall_to_wall_monitoring_export.csv");
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("CSV Compiled", "Download for 'it_wall_to_wall_monitoring_export.csv' has started.", "success");
    });

    // Logout
    const triggerLogout = () => {
      fetch('api.php?action=logout', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            sessionStorage.clear();
            showToast("Session Terminated", "Redirecting to login portal...", "info");
            setTimeout(() => {
              window.location.href = 'index.php';
            }, 600);
          } else {
            showToast("Logout failed", "Session clear error.", "danger");
          }
        })
        .catch(err => {
          window.location.href = 'index.php'; // fallback redirect
          console.error(err);
        });
    };

    if (btnLogout) {
      btnLogout.addEventListener('click', triggerLogout);
    }
    const btnLogoutSidebar = document.getElementById('btn-logout-sidebar');
    if (btnLogoutSidebar) {
      btnLogoutSidebar.addEventListener('click', triggerLogout);
    }

    // Check if ?view=edit_history or view=inventory is in URL search params
    const urlParams = new URLSearchParams(window.location.search);
    const isHistoryView = urlParams.get('view') === 'edit_history';
    const isInventoryView = urlParams.get('view') === 'inventory';

    if (isHistoryView) {
      const historyBanner = document.getElementById('edit-history-banner');
      if (historyBanner) historyBanner.style.display = 'flex';

      const assetsTable = document.getElementById('assets-table');
      if (assetsTable) assetsTable.style.display = 'none';

      const historyTable = document.getElementById('history-table');
      if (historyTable) historyTable.style.display = 'table';

      // Hide CRUD actions
      const btnAdd = document.getElementById('btn-add');
      const btnEdit = document.getElementById('btn-edit');
      const btnDelete = document.getElementById('btn-delete');
      const btnUpdateStatus = document.getElementById('btn-update-status');
      const btnGotoInventory = document.getElementById('btn-goto-inventory');

      if (btnAdd) btnAdd.style.display = 'none';
      if (btnEdit) btnEdit.style.display = 'none';
      if (btnDelete) btnDelete.style.display = 'none';
      if (btnUpdateStatus) btnUpdateStatus.style.display = 'none';
      if (btnGotoInventory) btnGotoInventory.style.display = 'none';

      // Switch filters toolbar search
      const assetFiltersPanel = document.getElementById('asset-filters-panel');
      const historyFiltersPanel = document.getElementById('history-filters-panel');
      const toolbarPageTitle = document.getElementById('toolbar-page-title');

      if (assetFiltersPanel) assetFiltersPanel.style.display = 'none';
      if (historyFiltersPanel) historyFiltersPanel.style.display = 'flex';
      if (toolbarPageTitle) toolbarPageTitle.textContent = "Modification History Log";

      // Hide filters drawer
      const filterDrawer = document.getElementById('filter-drawer');
      if (filterDrawer) filterDrawer.style.display = 'none';

      // Swap export buttons
      const btnExportCsv = document.getElementById('btn-export-csv');
      const btnExportHistoryCsv = document.getElementById('btn-export-history-csv');
      if (btnExportCsv) btnExportCsv.style.display = 'none';
      if (btnExportHistoryCsv) btnExportHistoryCsv.style.display = 'inline-block';

      // Clear history view banner button
      const btnClearHistoryView = document.getElementById('btn-clear-history-view');
      if (btnClearHistoryView) {
        btnClearHistoryView.addEventListener('click', () => {
          window.location.href = 'dashboard.php';
        });
      }

      // Search input handler
      const historySearchInput = document.getElementById('history-search-input');
      if (historySearchInput) {
        historySearchInput.addEventListener('input', (e) => {
          historySearchQuery = e.target.value.trim().toLowerCase();
          renderHistoryTable();
        });
      }

      // Export CSV handler
      if (btnExportHistoryCsv) {
        btnExportHistoryCsv.addEventListener('click', () => {
          exportHistoryCSV();
        });
      }

      // Sorting handler for history
      document.querySelectorAll('th[data-sort-history]').forEach(th => {
        th.addEventListener('click', () => {
          const dbCol = th.getAttribute('data-sort-history');

          document.querySelectorAll('th[data-sort-history]').forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
            const ind = header.querySelector('.sort-indicator-history');
            if (ind) ind.textContent = '';
          });

          if (historySortColumn === dbCol) {
            historySortOrder = historySortOrder === 'asc' ? 'desc' : 'asc';
          } else {
            historySortColumn = dbCol;
            historySortOrder = 'asc';
          }

          th.classList.add(historySortOrder === 'asc' ? 'sorted-asc' : 'sorted-desc');
          const ind = th.querySelector('.sort-indicator-history');
          if (ind) ind.textContent = historySortOrder === 'asc' ? ' ▲' : ' ▼';
          renderHistoryTable();
        });
      });

      // Initial history load
      fetchHistoryFromDatabase();
    } else if (isInventoryView) {
      const inventoryBanner = document.getElementById('inventory-banner');
      if (inventoryBanner) inventoryBanner.style.display = 'flex';

      const assetsTable = document.getElementById('assets-table');
      if (assetsTable) assetsTable.style.display = 'none';

      const inventoryTable = document.getElementById('inventory-table');
      if (inventoryTable) inventoryTable.style.display = 'table';

      // Hide CRUD actions
      const btnAdd = document.getElementById('btn-add');
      const btnEdit = document.getElementById('btn-edit');
      const btnDelete = document.getElementById('btn-delete');
      const btnUpdateStatus = document.getElementById('btn-update-status');
      const btnGotoInventory = document.getElementById('btn-goto-inventory');

      if (btnAdd) btnAdd.style.display = 'none';
      if (btnEdit) btnEdit.style.display = 'none';
      if (btnDelete) btnDelete.style.display = 'none';
      if (btnUpdateStatus) btnUpdateStatus.style.display = 'none';
      if (btnGotoInventory) btnGotoInventory.style.display = 'none';

      // Switch filters toolbar search
      const assetFiltersPanel = document.getElementById('asset-filters-panel');
      const inventoryFiltersPanel = document.getElementById('inventory-filters-panel');
      const toolbarPageTitle = document.getElementById('toolbar-page-title');

      if (assetFiltersPanel) assetFiltersPanel.style.display = 'none';
      if (inventoryFiltersPanel) inventoryFiltersPanel.style.display = 'flex';
      if (toolbarPageTitle) toolbarPageTitle.textContent = "Replaced Components Inventory";

      // Hide filters drawer
      const filterDrawer = document.getElementById('filter-drawer');
      if (filterDrawer) filterDrawer.style.display = 'none';

      // Swap export buttons
      const btnExportCsv = document.getElementById('btn-export-csv');
      const btnExportInventoryCsv = document.getElementById('btn-export-inventory-csv');
      if (btnExportCsv) btnExportCsv.style.display = 'none';
      if (btnExportInventoryCsv) btnExportInventoryCsv.style.display = 'inline-block';

      // Clear inventory view banner button
      const btnClearInventoryView = document.getElementById('btn-clear-inventory-view');
      if (btnClearInventoryView) {
        btnClearInventoryView.addEventListener('click', () => {
          window.location.href = 'dashboard.php';
        });
      }

      // Search input handler
      const inventorySearchInput = document.getElementById('inventory-search-input');
      if (inventorySearchInput) {
        inventorySearchInput.addEventListener('input', (e) => {
          inventorySearchQuery = e.target.value.trim().toLowerCase();
          renderInventoryTable();
        });
      }

      // Export CSV handler
      if (btnExportInventoryCsv) {
        btnExportInventoryCsv.addEventListener('click', () => {
          exportInventoryCSV();
        });
      }

      // Sorting handler for inventory
      document.querySelectorAll('th[data-sort-inventory]').forEach(th => {
        th.addEventListener('click', () => {
          const dbCol = th.getAttribute('data-sort-inventory');

          document.querySelectorAll('th[data-sort-inventory]').forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
            const ind = header.querySelector('.sort-indicator-inventory');
            if (ind) ind.textContent = '';
          });

          if (inventorySortColumn === dbCol) {
            inventorySortOrder = inventorySortOrder === 'asc' ? 'desc' : 'asc';
          } else {
            inventorySortColumn = dbCol;
            inventorySortOrder = 'asc';
          }

          th.classList.add(inventorySortOrder === 'asc' ? 'sorted-asc' : 'sorted-desc');
          const ind = th.querySelector('.sort-indicator-inventory');
          if (ind) ind.textContent = inventorySortOrder === 'asc' ? ' ▲' : ' ▼';
          renderInventoryTable();
        });
      });

      // Initial inventory load
      fetchInventoryFromDatabase();
    } else {
      const btnGotoInventory = document.getElementById('btn-goto-inventory');
      if (btnGotoInventory) {
        btnGotoInventory.addEventListener('click', () => {
          window.location.href = 'dashboard.php?view=inventory';
        });
      }

      // Initial assets load on document ready
      fetchAssetsFromDatabase();
    }

  }

});
