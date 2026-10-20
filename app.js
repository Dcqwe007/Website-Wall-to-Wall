document.addEventListener('DOMContentLoaded', () => {

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  const htmlspecialchars = escapeHtml;

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

      const usernameInput = document.getElementById('signup-username').value.trim().toLowerCase();
      const emailInput = document.getElementById('signup-email').value.trim().toLowerCase();
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
            successMessage.textContent = "Account created successfully! Use your username or email and password to sign in.";
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

    // Storage states
    let storageList = [];
    let currentFilteredStorage = [];
    let storageSortColumn = 'added_at';
    let storageSortOrder = 'desc';
    let storageSearchQuery = '';

    // Multi-faceted Filter States
    let selectedAsset = 'All';
    let selectedProgram = 'All';
    let selectedFloor = 'All';
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

    // Filter Select Dropdowns
    const selectAsset = document.getElementById('select-asset');
    const selectProgram = document.getElementById('select-program');
    const selectFloor = document.getElementById('select-floor');
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
      if (selectedAsset !== 'All') count++;
      if (selectedProgram !== 'All') count++;
      if (selectedFloor !== 'All') count++;
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

      // Sync selectAsset dropdown value
      if (selectAsset) {
        selectAsset.value = selectedAsset;
      }

      // Populate dynamic dropdowns
      selectedProgram = populateDropdown(selectProgram, 'Program', 'All Programs', selectedProgram);
      selectedFloor = populateDropdown(selectFloor, 'Asset_located_floor', 'All Floors', selectedFloor);
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

    // Dynamically sync form select dropdowns with unique database values for CPU model, CPU brand, Monitor models, and Monitor brands
    function syncFormSelectDropdowns() {
      // 1. Gather unique CPU Models
      const cpuModels = [...new Set(assetsList.map(a => a.CPU_Model).filter(m => m && m.trim() !== '' && m.trim() !== '-'))];
      cpuModels.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      // 2. Gather unique CPU Brands
      const cpuBrands = [...new Set(assetsList.map(a => a.CPU_Brand).filter(b => b && b.trim() !== '' && b.trim() !== '-'))];
      cpuBrands.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      // 3. Gather unique Monitor Models
      const monModelsList = [];
      assetsList.forEach(a => {
        if (a.Monitor1_Model && a.Monitor1_Model.trim() !== '' && a.Monitor1_Model.trim() !== '-') monModelsList.push(a.Monitor1_Model.trim());
        if (a.Monitor2_Model && a.Monitor2_Model.trim() !== '' && a.Monitor2_Model.trim() !== '-') monModelsList.push(a.Monitor2_Model.trim());
        if (a.Monitor3_Model && a.Monitor3_Model.trim() !== '' && a.Monitor3_Model.trim() !== '-') monModelsList.push(a.Monitor3_Model.trim());
      });
      const uniqueMonModels = [...new Set(monModelsList)];
      uniqueMonModels.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      // 4. Gather unique Monitor Brands
      const monBrandsList = [];
      assetsList.forEach(a => {
        if (a.Monitor1_Brand && a.Monitor1_Brand.trim() !== '' && a.Monitor1_Brand.trim() !== '-') monBrandsList.push(a.Monitor1_Brand.trim());
        if (a.Monitor2_Brand && a.Monitor2_Brand.trim() !== '' && a.Monitor2_Brand.trim() !== '-') monBrandsList.push(a.Monitor2_Brand.trim());
        if (a.Monitor3_Brand && a.Monitor3_Brand.trim() !== '' && a.Monitor3_Brand.trim() !== '-') monBrandsList.push(a.Monitor3_Brand.trim());
      });
      const uniqueMonBrands = [...new Set(monBrandsList)];
      uniqueMonBrands.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      // Helper function to sync dropdown element options
      function populateFormDropdown(elementId, items, placeholder) {
        const selectEl = document.getElementById(elementId);
        if (!selectEl) return;
        const currentVal = selectEl.value;
        selectEl.innerHTML = `<option value="">${placeholder}</option>`;
        items.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item;
          opt.textContent = item;
          selectEl.appendChild(opt);
        });
        selectEl.value = currentVal;
      }

      // Populate CPU Model dropdowns
      populateFormDropdown('add-cpu-model', cpuModels, '-- Select CPU Model --');
      populateFormDropdown('edit-cpu-model', cpuModels, '-- Select CPU Model --');

      // Populate CPU Brand dropdowns
      populateFormDropdown('add-cpu-brand', cpuBrands, '-- Select CPU Brand --');
      populateFormDropdown('edit-cpu-brand', cpuBrands, '-- Select CPU Brand --');

      // Populate Monitor Models
      populateFormDropdown('add-mon1-model', uniqueMonModels, '-- None / Select Monitor Model --');
      populateFormDropdown('edit-mon1-model', uniqueMonModels, '-- None / Select Monitor Model --');
      populateFormDropdown('add-mon2-model', uniqueMonModels, '-- None / Select Monitor Model --');
      populateFormDropdown('edit-mon2-model', uniqueMonModels, '-- None / Select Monitor Model --');
      populateFormDropdown('add-mon3-model', uniqueMonModels, '-- None / Select Monitor Model --');
      populateFormDropdown('edit-mon3-model', uniqueMonModels, '-- None / Select Monitor Model --');

      // Populate Monitor Brands
      populateFormDropdown('add-mon1-brand', uniqueMonBrands, '-- None / Select Monitor Brand --');
      populateFormDropdown('edit-mon1-brand', uniqueMonBrands, '-- None / Select Monitor Brand --');
      populateFormDropdown('add-mon2-brand', uniqueMonBrands, '-- None / Select Monitor Brand --');
      populateFormDropdown('edit-mon2-brand', uniqueMonBrands, '-- None / Select Monitor Brand --');
      populateFormDropdown('add-mon3-brand', uniqueMonBrands, '-- None / Select Monitor Brand --');
      populateFormDropdown('edit-mon3-brand', uniqueMonBrands, '-- None / Select Monitor Brand --');

      // 5. Gather unique Located Floors
      const floorList = [...new Set(assetsList.map(a => a.Asset_located_floor).filter(f => f && f.trim() !== '' && f.trim() !== '-'))];
      ['Ground Floor', '1st', '2nd', '3rd', '4th', '5th', '6th'].forEach(f => {
        if (!floorList.includes(f)) floorList.push(f);
      });
      floorList.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      // Populate Located Floor dropdowns
      populateFormDropdown('add-floor', floorList, '-- Select Located Floor --');
      populateFormDropdown('edit-floor', floorList, '-- Select Located Floor --');
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
            assetsList = (res.data || []).map(asset => ({
              ...asset,
              Station_Number: asset.Station_Number ?? asset.station_number,
              CPU_Model: asset.CPU_Model ?? asset.cpu_model,
              CPU_Serial: asset.CPU_Serial ?? asset.cpu_serial,
              CPU_Brand: asset.CPU_Brand ?? asset.cpu_brand,
              Monitor1_Model: asset.Monitor1_Model ?? asset.monitor1_model,
              Monitor1_Serial: asset.Monitor1_Serial ?? asset.monitor1_serial,
              Monitor1_Brand: asset.Monitor1_Brand ?? asset.monitor1_brand,
              Monitor2_Model: asset.Monitor2_Model ?? asset.monitor2_model,
              Monitor2_Serial: asset.Monitor2_Serial ?? asset.monitor2_serial,
              Monitor2_Brand: asset.Monitor2_Brand ?? asset.monitor2_brand,
              Monitor3_Model: asset.Monitor3_Model ?? asset.monitor3_model,
              Monitor3_Serial: asset.Monitor3_Serial ?? asset.monitor3_serial,
              Monitor3_Brand: asset.Monitor3_Brand ?? asset.monitor3_brand,
              Program: asset.Program ?? asset.program,
              Asset_located_floor: asset.Asset_located_floor ?? asset.asset_located_floor,
              Site: asset.Site ?? asset.site,
              Current_Status: asset.Current_Status ?? asset.current_status,
              Created_Date: asset.Created_Date ?? asset.created_date,
              Modified_Date: asset.Modified_Date ?? asset.modified_date
            }));
            assetsList.forEach(a => {
              if (a.Current_Status === 'Deployed') {
                a.Current_Status = 'Onsite Deployed';
              }
            });
            populateFilterDropdowns();
            syncProgramDropdowns();
            syncFormSelectDropdowns();
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

    // Load storage items from database API
    function fetchStorageFromDatabase() {
      fetch('api.php?action=storage&_t=' + Date.now())
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            storageList = res.data || [];
            renderStorageTable();
          } else {
            showToast("Fetch Error", res.message || "Failed to fetch storage items.", "danger");
          }
        })
        .catch(err => {
          console.error("Storage fetch failed", err);
          renderStorageTable();
        });
    }

    function fetchStorageRequests() {
      const requestList = document.getElementById('storage-request-list');
      const tableWrapper = document.getElementById('storage-request-table-wrapper');
      const tableBody = document.getElementById('storage-request-table-body');
      if (!requestList) return;

      fetch('api.php?action=storage_requests&_t=' + Date.now())
        .then(res => res.json())
        .then(res => {
          if (!res.success || !Array.isArray(res.data)) {
            requestList.innerHTML = '<div style="color: #B91C1C; font-size: 13px;">Unable to load storage requests.</div>';
            if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" style="padding: 12px; color: #B91C1C;">Unable to load requests.</td></tr>';
            return;
          }

          const requests = res.data;
          if (!requests.length) {
            requestList.innerHTML = '<div style="color: #4B5563; font-size: 13px;">No storage asset requests yet.</div>';
            if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" style="padding: 12px; color: #4B5563;">No asset requests found.</td></tr>';
            return;
          }

          requestList.innerHTML = requests.slice(0, 6).map(item => {
            const requestedAt = item.requested_at ? new Date(item.requested_at.replace(' ', 'T')).toLocaleString([], {
              year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
            }) : 'N/A';

            return `
              <div style="background: rgba(255,255,255,0.72); border: 1px solid rgba(11,47,42,0.12); border-radius: 8px; padding: 12px; min-height: 110px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px;">
                  <span style="font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #0B2F2A; font-weight: 700;">${htmlspecialchars(item.asset_type || 'CPU')}</span>
                  <span style="background: rgba(37, 226, 204, 0.15); color: #0B2F2A; border: 1px solid rgba(11,47,42,0.12); border-radius: 999px; padding: 3px 8px; font-size: 10px; font-weight: 700;">${htmlspecialchars(item.purpose || 'Replacement')}</span>
                </div>
                <div style="font-size: 12px; color: #1F2937; font-weight: 700; margin-bottom: 4px;">${htmlspecialchars(item.it_rep || 'Unknown IT Rep')}</div>
                <div style="font-size: 11px; color: #4B5563; line-height: 1.5;">${htmlspecialchars(requestedAt)}</div>
              </div>
            `;
          }).join('');

          if (tableBody) {
            tableBody.innerHTML = requests.map(item => {
              const requestedAt = item.requested_at ? new Date(item.requested_at.replace(' ', 'T')).toLocaleString([], {
                year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
              }) : 'N/A';

              const notes = item.notes ? htmlspecialchars(item.notes) : '—';
              const status = String(item.status || 'Pending').trim();
              const isDone = status.toLowerCase() === 'done' || status.toLowerCase() === 'completed';
              const actionCell = isDone
                ? '<span style="color: #0f5132; font-weight: 700;">Completed</span>'
                : '<button type="button" class="btn-mark-request-done" data-request-id="' + item.id + '" style="background: #003D5B; color: white; border: none; border-radius: 4px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">Done</button>';

              return `
                <tr style="border-top: 1px solid #D9EAE7;">
                  <td style="padding: 10px 12px; color: #1F2937; font-weight: 600;">${htmlspecialchars(item.it_rep || 'Unknown')}</td>
                  <td style="padding: 10px 12px; color: #1F2937;">${htmlspecialchars(item.asset_type || 'CPU')}</td>
                  <td style="padding: 10px 12px; color: #1F2937;">${htmlspecialchars(item.purpose || 'Replacement')}</td>
                  <td style="padding: 10px 12px; color: #1F2937;">${htmlspecialchars(requestedAt)}</td>
                  <td style="padding: 10px 12px; color: #1F2937;">${notes}</td>
                  <td style="padding: 10px 12px;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.04em; ${isDone ? 'background: rgba(40, 167, 69, 0.14); color: #0f5132;' : 'background: rgba(255, 193, 7, 0.18); color: #7a5300;'}">
                      ${htmlspecialchars(status || 'Pending')}
                    </span>
                  </td>
                  <td style="padding: 10px 12px;">${actionCell}</td>
                </tr>
              `;
            }).join('');

            const doneButtons = tableBody.querySelectorAll('.btn-mark-request-done');
            doneButtons.forEach(button => {
              button.addEventListener('click', () => {
                const requestId = button.getAttribute('data-request-id');
                fetch('api.php?action=update_storage_request_status', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: requestId, status: 'Done' })
                })
                .then(response => response.json())
                .then(result => {
                  if (result.success) {
                    showToast('Request Updated', 'The request has been marked as done.', 'success');
                    fetchStorageRequests();
                  } else {
                    showToast('Update Failed', result.message || 'Unable to update request status.', 'danger');
                  }
                })
                .catch(() => {
                  showToast('Update Failed', 'Unable to update request status.', 'danger');
                });
              });
            });
          }

          if (requestList) {
            requestList.style.display = 'none';
          }

          if (tableWrapper) {
            tableWrapper.style.display = 'block';
            tableWrapper.style.maxHeight = '260px';
            tableWrapper.style.overflowY = 'auto';
            tableWrapper.style.overflowX = 'auto';
          }
        })
        .catch(() => {
          requestList.innerHTML = '<div style="color: #B91C1C; font-size: 13px;">Unable to load storage requests.</div>';
          if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" style="padding: 12px; color: #B91C1C;">Unable to load requests.</td></tr>';
        });
    }

    // Render storage table
    function renderStorageTable() {
      const storageTableBody = document.getElementById('storage-table-body');
      const emptyMessage = document.getElementById('table-empty-message');
      const emptyMessageText = document.getElementById('empty-message-text');
      const statsText = document.getElementById('footer-stats-text');

      if (!storageTableBody) return;
      storageTableBody.innerHTML = '';

      let filtered = storageList.filter(item => {
        if (storageSearchQuery) {
          const matchStr = `${item.asset_type || ''} ${item.model || ''} ${item.serial_number || ''} ${item.brand || ''} ${item.location || ''} ${item.username || ''} ${item.status || ''}`.toLowerCase();
          return matchStr.includes(storageSearchQuery);
        }
        return true;
      });

      filtered.sort((a, b) => {
        let valA = a[storageSortColumn];
        let valB = b[storageSortColumn];
        if (storageSortColumn === 'id') {
          valA = parseInt(valA) || 0;
          valB = parseInt(valB) || 0;
        } else {
          valA = (valA || '').toString().toLowerCase();
          valB = (valB || '').toString().toLowerCase();
        }
        if (valA < valB) return storageSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return storageSortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      currentFilteredStorage = filtered;

      if (filtered.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'flex';
        if (emptyMessageText) emptyMessageText.textContent = "No storage items found.";
      } else {
        if (emptyMessage) emptyMessage.style.display = 'none';

        filtered.forEach(item => {
          const tr = document.createElement('tr');
          tr.setAttribute('data-id', item.id);

          let statusStyle = 'background: #E2ECEB; color: #003D5B; border: 1px solid #A8D8D5;';
          const st = (item.status || 'In Storage').toLowerCase();
          if (st === 'working') {
            statusStyle = 'background: rgba(16, 185, 129, 0.15); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3);';
          } else if (st === 'disposal') {
            statusStyle = 'background: rgba(239, 68, 68, 0.15); color: #DC2626; border: 1px solid rgba(239, 68, 68, 0.3);';
          } else if (st === 'for repair') {
            statusStyle = 'background: rgba(245, 158, 11, 0.15); color: #D97706; border: 1px solid rgba(245, 158, 11, 0.3);';
          }

          tr.innerHTML = `
            <td>${item.added_at ? item.added_at.substring(0, 16) : 'N/A'}</td>
            <td><strong style="color: #003D5B;">${htmlspecialchars(item.asset_type || 'General')}</strong></td>
            <td>${htmlspecialchars(item.brand || '-')}</td>
            <td>${htmlspecialchars(item.model || '-')}</td>
            <td><code style="background: rgba(0, 61, 91, 0.08); padding: 2px 6px; border-radius: 4px; font-weight: 600;">${htmlspecialchars(item.serial_number || '-')}</code></td>
            <td><span style="background: rgba(37, 226, 204, 0.15); color: #00665E; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">${htmlspecialchars(item.location || 'Main Storage')}</span></td>
            <td>${htmlspecialchars(item.username || 'System')}</td>
            <td><span class="status-pill" style="padding: 3px 10px; border-radius: 12px; font-weight: 600; font-size: 11px; ${statusStyle}">${htmlspecialchars(item.status || 'In Storage')}</span></td>
            <td>
              <button class="btn-scrap-storage" data-id="${item.id}" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); cursor: pointer; color: #EF4444; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 11px; transition: all 0.15s ease;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'">
                Remove
              </button>
            </td>
          `;

          const scrapBtn = tr.querySelector('.btn-scrap-storage');
          if (scrapBtn) {
            scrapBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              if (confirm("Are you sure you want to remove this item from storage?")) {
                fetch('api.php?action=delete_storage', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: item.id })
                })
                .then(res => res.json())
                .then(res => {
                  if (res.success) {
                    showToast("Storage Item Removed", "Item removed from storage inventory.", "success");
                    fetchStorageFromDatabase();
                  } else {
                    showToast("Action Failed", res.message || "Could not remove item.", "danger");
                  }
                });
              }
            });
          }

          storageTableBody.appendChild(tr);
        });
      }

      if (statsText) {
        statsText.innerHTML = `Total Storage Items: <strong>${storageList.length}</strong> | Visible: <strong>${filtered.length}</strong>`;
      }
    }

    // Export Storage list to CSV
    function exportStorageCSV() {
      const listToExport = currentFilteredStorage.length > 0 ? currentFilteredStorage : storageList;

      if (listToExport.length === 0) {
        showToast("Export Failed", "There are no storage items to download.", "danger");
        return;
      }

      const headers = ["ID", "Date Added", "Asset Type", "Brand", "Model", "Serial Number", "Location", "Operator", "Status"];
      let csvContent = headers.join(",") + "\r\n";

      listToExport.forEach(item => {
        const row = [
          item.id,
          item.added_at,
          item.asset_type,
          item.brand,
          item.model,
          item.serial_number,
          item.location,
          item.username,
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
      link.setAttribute("download", "it_wall_to_wall_storage_export.csv");
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("CSV Compiled", "Download for 'it_wall_to_wall_storage_export.csv' has started.", "success");
    }

    /* ========================================================
       RENDER AND FILTER TABLE (Enterprise DataGridView Style)
       ======================================================== */
    function renderTable() {
      tableBody.innerHTML = '';

      // 1. Client side filters (Search input & dynamic dropdown filters)
      let filtered = assetsList.filter(asset => {
        if (selectedAsset === 'CPU') {
          const hasCpu = (asset.CPU_Model && asset.CPU_Model.trim() !== '' && asset.CPU_Model.trim() !== '-') ||
                         (asset.CPU_Serial && asset.CPU_Serial.trim() !== '' && asset.CPU_Serial.trim() !== '-') ||
                         (asset.CPU_Brand && asset.CPU_Brand.trim() !== '' && asset.CPU_Brand.trim() !== '-');
          if (!hasCpu) return false;
        } else if (selectedAsset === 'Monitor') {
          const hasMonitor = [
            asset.Monitor1_Model, asset.Monitor1_Serial, asset.Monitor1_Brand,
            asset.Monitor2_Model, asset.Monitor2_Serial, asset.Monitor2_Brand,
            asset.Monitor3_Model, asset.Monitor3_Serial, asset.Monitor3_Brand
          ].some(val => val && val.trim() !== '' && val.trim() !== '-');
          if (!hasMonitor) return false;
        }

        if (selectedProgram !== 'All' && asset.Program !== selectedProgram) return false;
        if (selectedFloor !== 'All' && asset.Asset_located_floor !== selectedFloor) return false;
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

    // Bind change events to dropdown selects
    const filterConfig = [
      { element: selectAsset, stateSetter: val => { selectedAsset = val; } },
      { element: selectProgram, stateSetter: val => { selectedProgram = val; } },
      { element: selectFloor, stateSetter: val => { selectedFloor = val; } },
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
        selectedAsset = 'All';
        selectedProgram = 'All';
        selectedFloor = 'All';
        selectedSite = 'All';
        selectedStatus = 'All';

        if (selectAsset) selectAsset.value = 'All';
        if (selectProgram) selectProgram.value = 'All';
        if (selectFloor) selectFloor.value = 'All';
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
    const modalAddStorage = document.getElementById('modal-add-storage');
    const modalBulkStorage = document.getElementById('modal-bulk-storage');
    const modalBulkAssets = document.getElementById('modal-bulk-assets');

    function openModal(modal) {
      if (modal) {
        modal.classList.add('open');
        modal.style.display = 'flex';
      }
    }
    function closeModal(modal) {
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    }

    function setupModalClose(modal, closeBtnId, cancelBtnId) {
      if (!modal) return;
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
    setupModalClose(modalAddStorage, 'btn-close-add-storage', 'btn-cancel-add-storage');
    setupModalClose(modalBulkStorage, 'btn-close-bulk-storage', 'btn-cancel-bulk-storage');
    setupModalClose(modalBulkAssets, 'btn-close-bulk-assets', 'btn-cancel-bulk-assets');

    // Trigger Add Storage Modal
    const btnAddStorageItem = document.getElementById('btn-add-storage-item');
    if (btnAddStorageItem && modalAddStorage) {
      btnAddStorageItem.addEventListener('click', () => {
        const form = document.getElementById('form-add-storage');
        if (form) form.reset();
        const detailsPanel = document.getElementById('storage-asset-details-panel');
        if (detailsPanel) detailsPanel.style.display = 'none';
        openModal(modalAddStorage);
      });
    }

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
        Current_Status: document.getElementById('add-status').value
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

      function selectValueInDropdown(elementId, val) {
        const selectEl = document.getElementById(elementId);
        if (!selectEl) return;
        const normalizedVal = val ? val.trim() : '';
        if (normalizedVal !== '') {
          let exists = false;
          for (let i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i].value === normalizedVal) {
              exists = true;
              break;
            }
          }
          if (!exists) {
            const opt = document.createElement('option');
            opt.value = normalizedVal;
            opt.textContent = normalizedVal;
            selectEl.appendChild(opt);
          }
        }
        selectEl.value = normalizedVal;
      }

      selectValueInDropdown('edit-cpu-model', asset.CPU_Model);
      document.getElementById('edit-cpu-serial').value = asset.CPU_Serial || '';
      selectValueInDropdown('edit-cpu-brand', asset.CPU_Brand);

      selectValueInDropdown('edit-mon1-model', asset.Monitor1_Model);
      document.getElementById('edit-mon1-serial').value = asset.Monitor1_Serial || '';
      selectValueInDropdown('edit-mon1-brand', asset.Monitor1_Brand);

      selectValueInDropdown('edit-mon2-model', asset.Monitor2_Model);
      document.getElementById('edit-mon2-serial').value = asset.Monitor2_Serial || '';
      selectValueInDropdown('edit-mon2-brand', asset.Monitor2_Brand);

      selectValueInDropdown('edit-mon3-model', asset.Monitor3_Model);
      document.getElementById('edit-mon3-serial').value = asset.Monitor3_Serial || '';
      selectValueInDropdown('edit-mon3-brand', asset.Monitor3_Brand);

      document.getElementById('edit-program').value = asset.Program || '';
      selectValueInDropdown('edit-floor', asset.Asset_located_floor);
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
        Current_Status: document.getElementById('edit-status').value
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
      selectedAsset = 'All';
      selectedProgram = 'All';
      selectedFloor = 'All';
      selectedSite = 'All';
      selectedStatus = 'All';

      if (searchInput) searchInput.value = '';
      if (selectAsset) selectAsset.value = 'All';
      if (selectProgram) selectProgram.value = 'All';
      if (selectFloor) selectFloor.value = 'All';
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
        "Station_Number", "CPU_Model", "CPU_Serial", "CPU_Brand",
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

    // Check if ?view=edit_history, view=inventory, or view=storage is in URL search params
    const urlParams = new URLSearchParams(window.location.search);
    const isHistoryView = urlParams.get('view') === 'edit_history';
    const isInventoryView = urlParams.get('view') === 'inventory';
    const isStorageView = urlParams.get('view') === 'storage';
    const isRequestedAssetsView = urlParams.get('view') === 'requested_assets';

    const bindRequestAssetModalHandlers = () => {
      const btnRequestStorageAsset = document.getElementById('btn-request-storage-asset');
      const btnOpenStorageRequestModal = document.getElementById('btn-open-storage-request-modal');
      const btnShowRequestedAssets = document.getElementById('btn-show-requested-assets');
      const modalRequestStorage = document.getElementById('modal-request-storage');
      const btnCloseRequestStorage = document.getElementById('btn-close-request-storage');
      const btnCancelRequestStorage = document.getElementById('btn-cancel-request-storage');
      const formRequestStorage = document.getElementById('form-request-storage');
      const requestTableWrapper = document.getElementById('storage-request-table-wrapper');
      const requestList = document.getElementById('storage-request-list');

      const openStorageRequestModal = () => {
        const datetimeInput = document.getElementById('storage-request-datetime');
        if (datetimeInput && !datetimeInput.value) {
          const now = new Date();
          const localValue = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
          datetimeInput.value = localValue;
        }
        if (modalRequestStorage) openModal(modalRequestStorage);
      };

      if (btnShowRequestedAssets) {
        btnShowRequestedAssets.addEventListener('click', () => {
          if (requestTableWrapper) {
            const isVisible = requestTableWrapper.style.display !== 'none';
            requestTableWrapper.style.display = isVisible ? 'none' : 'block';
          }
          if (requestList) {
            requestList.style.display = requestTableWrapper && requestTableWrapper.style.display !== 'none' ? 'none' : 'grid';
          }
          if (requestTableWrapper && requestTableWrapper.style.display !== 'none') {
            fetchStorageRequests();
          }
        });
      }

      if (btnRequestStorageAsset && modalRequestStorage) {
        btnRequestStorageAsset.addEventListener('click', openStorageRequestModal);
      }

      if (btnOpenStorageRequestModal && modalRequestStorage) {
        btnOpenStorageRequestModal.addEventListener('click', openStorageRequestModal);
      }

      if (btnCloseRequestStorage && modalRequestStorage) {
        btnCloseRequestStorage.addEventListener('click', () => closeModal(modalRequestStorage));
      }

      if (btnCancelRequestStorage && modalRequestStorage) {
        btnCancelRequestStorage.addEventListener('click', () => closeModal(modalRequestStorage));
      }

      if (formRequestStorage && modalRequestStorage) {
        formRequestStorage.addEventListener('submit', (e) => {
          e.preventDefault();

          const payload = {
            it_rep: document.getElementById('storage-request-it-rep').value.trim(),
            asset_type: document.getElementById('storage-request-asset-type').value,
            purpose: document.getElementById('storage-request-purpose').value,
            requested_at: document.getElementById('storage-request-datetime').value,
            notes: document.getElementById('storage-request-notes').value.trim()
          };

          fetch('api.php?action=add_storage_request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          .then(res => res.json())
          .then(res => {
            if (res.success) {
              showToast('Request Logged', 'Storage asset request was submitted successfully.', 'success');
              formRequestStorage.reset();
              closeModal(modalRequestStorage);
              fetchStorageRequests();
            } else {
              showToast('Request Failed', res.message || 'Unable to submit the storage request.', 'danger');
            }
          })
          .catch(() => {
            showToast('Request Failed', 'Unable to submit the storage request.', 'danger');
          });
        });
      }
    };

    if (isRequestedAssetsView) {
      const storageRequestPanel = document.getElementById('storage-request-panel');
      if (storageRequestPanel) storageRequestPanel.style.display = 'block';

      const requestList = document.getElementById('storage-request-list');
      if (requestList) requestList.style.display = 'none';

      const tableWrapper = document.getElementById('storage-request-table-wrapper');
      if (tableWrapper) tableWrapper.style.display = 'block';

      const assetsTable = document.getElementById('assets-table');
      if (assetsTable) assetsTable.style.display = 'none';

      const storageTable = document.getElementById('storage-table');
      if (storageTable) storageTable.style.display = 'none';

      const toolbarPageTitle = document.getElementById('toolbar-page-title');
      if (toolbarPageTitle) toolbarPageTitle.textContent = 'Requested Assets';

      const assetFiltersPanel = document.getElementById('asset-filters-panel');
      const storageFiltersPanel = document.getElementById('storage-filters-panel');
      const filterDrawer = document.getElementById('filter-drawer');
      if (assetFiltersPanel) assetFiltersPanel.style.display = 'none';
      if (storageFiltersPanel) storageFiltersPanel.style.display = 'none';
      if (filterDrawer) filterDrawer.style.display = 'none';

      const btnAdd = document.getElementById('btn-add');
      const btnEdit = document.getElementById('btn-edit');
      const btnDelete = document.getElementById('btn-delete');
      const btnUpdateStatus = document.getElementById('btn-update-status');
      const btnGotoInventory = document.getElementById('btn-goto-inventory');
      const btnBulkAssets = document.getElementById('btn-bulk-assets');
      const btnAddStorageItem = document.getElementById('btn-add-storage-item');
      const btnRequestStorageAsset = document.getElementById('btn-request-storage-asset');
      const btnBulkStorage = document.getElementById('btn-bulk-storage');

      if (btnAdd) btnAdd.style.display = 'none';
      if (btnEdit) btnEdit.style.display = 'none';
      if (btnDelete) btnDelete.style.display = 'none';
      if (btnUpdateStatus) btnUpdateStatus.style.display = 'none';
      if (btnGotoInventory) btnGotoInventory.style.display = 'none';
      if (btnBulkAssets) btnBulkAssets.style.display = 'none';
      if (btnAddStorageItem) btnAddStorageItem.style.display = 'none';
      if (btnBulkStorage) btnBulkStorage.style.display = 'none';

      bindRequestAssetModalHandlers();
      fetchStorageRequests();
    } else if (isHistoryView) {
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
      const btnBulkAssets = document.getElementById('btn-bulk-assets');

      if (btnAdd) btnAdd.style.display = 'none';
      if (btnEdit) btnEdit.style.display = 'none';
      if (btnDelete) btnDelete.style.display = 'none';
      if (btnUpdateStatus) btnUpdateStatus.style.display = 'none';
      if (btnGotoInventory) btnGotoInventory.style.display = 'none';
      if (btnBulkAssets) btnBulkAssets.style.display = 'none';

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
      const btnBulkAssets = document.getElementById('btn-bulk-assets');

      if (btnAdd) btnAdd.style.display = 'none';
      if (btnEdit) btnEdit.style.display = 'none';
      if (btnDelete) btnDelete.style.display = 'none';
      if (btnUpdateStatus) btnUpdateStatus.style.display = 'none';
      if (btnGotoInventory) btnGotoInventory.style.display = 'none';
      if (btnBulkAssets) btnBulkAssets.style.display = 'none';

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
    } else if (isStorageView) {
      const storageBanner = document.getElementById('storage-banner');
      if (storageBanner) storageBanner.style.display = 'flex';

      const storageRequestPanel = document.getElementById('storage-request-panel');
      if (storageRequestPanel) storageRequestPanel.style.display = 'none';

      const requestListOnLoad = document.getElementById('storage-request-list');
      if (requestListOnLoad) requestListOnLoad.style.display = 'none';

      const requestTableWrapperOnLoad = document.getElementById('storage-request-table-wrapper');
      if (requestTableWrapperOnLoad) requestTableWrapperOnLoad.style.display = 'none';

      const assetsTable = document.getElementById('assets-table');
      if (assetsTable) assetsTable.style.display = 'none';

      const storageTable = document.getElementById('storage-table');
      if (storageTable) storageTable.style.display = 'table';

      // Hide CRUD actions
      const btnAdd = document.getElementById('btn-add');
      const btnEdit = document.getElementById('btn-edit');
      const btnDelete = document.getElementById('btn-delete');
      const btnUpdateStatus = document.getElementById('btn-update-status');
      const btnGotoInventory = document.getElementById('btn-goto-inventory');
      const btnBulkAssets = document.getElementById('btn-bulk-assets');

      if (btnAdd) btnAdd.style.display = 'none';
      if (btnEdit) btnEdit.style.display = 'none';
      if (btnDelete) btnDelete.style.display = 'none';
      if (btnUpdateStatus) btnUpdateStatus.style.display = 'none';
      if (btnGotoInventory) btnGotoInventory.style.display = 'none';
      if (btnBulkAssets) btnBulkAssets.style.display = 'none';

      // Switch filters toolbar search
      const assetFiltersPanel = document.getElementById('asset-filters-panel');
      const storageFiltersPanel = document.getElementById('storage-filters-panel');
      const toolbarPageTitle = document.getElementById('toolbar-page-title');

      if (assetFiltersPanel) assetFiltersPanel.style.display = 'none';
      if (storageFiltersPanel) storageFiltersPanel.style.display = 'flex';
      if (toolbarPageTitle) toolbarPageTitle.textContent = "Storage Room Inventory";

      // Hide filters drawer
      const filterDrawer = document.getElementById('filter-drawer');
      if (filterDrawer) filterDrawer.style.display = 'none';

      // Swap export buttons
      const btnExportCsv = document.getElementById('btn-export-csv');
      const btnExportStorageCsv = document.getElementById('btn-export-storage-csv');
      const btnFooterBulkStorage = document.getElementById('btn-footer-bulk-storage');
      if (btnExportCsv) btnExportCsv.style.display = 'none';
      if (btnExportStorageCsv) btnExportStorageCsv.style.display = 'inline-block';
      if (btnFooterBulkStorage) btnFooterBulkStorage.style.display = 'inline-block';

      // Clear storage view banner button
      const btnClearStorageView = document.getElementById('btn-clear-storage-view');
      if (btnClearStorageView) {
        btnClearStorageView.addEventListener('click', () => {
          window.location.href = 'dashboard.php';
        });
      }

      // Search input handler
      const storageSearchInput = document.getElementById('storage-search-input');
      if (storageSearchInput) {
        storageSearchInput.addEventListener('input', (e) => {
          storageSearchQuery = e.target.value.trim().toLowerCase();
          renderStorageTable();
        });
      }

      bindRequestAssetModalHandlers();
      fetchStorageRequests();

      // Export CSV handler
      if (btnExportStorageCsv) {
        btnExportStorageCsv.addEventListener('click', () => {
          exportStorageCSV();
        });
      }

      // Add storage modal triggers
      const btnAddStorageItem = document.getElementById('btn-add-storage-item');
      const modalAddStorage = document.getElementById('modal-add-storage');
      const btnCloseAddStorage = document.getElementById('btn-close-add-storage');
      const btnCancelAddStorage = document.getElementById('btn-cancel-add-storage');
      const formAddStorage = document.getElementById('form-add-storage');

      if (btnAddStorageItem && modalAddStorage) {
        btnAddStorageItem.addEventListener('click', () => {
          modalAddStorage.style.display = 'flex';
        });
      }

      if (btnCloseAddStorage && modalAddStorage) {
        btnCloseAddStorage.addEventListener('click', () => {
          modalAddStorage.style.display = 'none';
        });
      }

      if (btnCancelAddStorage && modalAddStorage) {
        btnCancelAddStorage.addEventListener('click', () => {
          modalAddStorage.style.display = 'none';
        });
      }

      const storageAlsoAddAsset = document.getElementById('storage-also-add-asset');
      const storageAssetDetailsPanel = document.getElementById('storage-asset-details-panel');

      if (storageAlsoAddAsset && storageAssetDetailsPanel) {
        storageAlsoAddAsset.addEventListener('change', (e) => {
          storageAssetDetailsPanel.style.display = e.target.checked ? 'block' : 'none';
        });
      }

      if (formAddStorage && modalAddStorage) {
        formAddStorage.addEventListener('submit', (e) => {
          e.preventDefault();
          const assetType = document.getElementById('storage-asset-type').value;
          const brand = document.getElementById('storage-brand').value;
          const model = document.getElementById('storage-model').value;
          const serial = document.getElementById('storage-serial').value;
          const status = document.getElementById('storage-status').value;
          const operator = document.getElementById('storage-operator').value;
          const location = document.getElementById('storage-location').value;
          const alsoAddAsset = storageAlsoAddAsset ? storageAlsoAddAsset.checked : false;
          const stationNumber = document.getElementById('storage-asset-station')?.value || 0;
          const program = document.getElementById('storage-asset-program')?.value || '';
          const floor = document.getElementById('storage-asset-floor')?.value || '';
          const site = document.getElementById('storage-asset-site')?.value || '';

          fetch('api.php?action=add_storage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              asset_type: assetType,
              brand: brand,
              model: model,
              serial_number: serial,
              status: status,
              operator: operator,
              location: location,
              quantity: 1,
              also_add_asset: alsoAddAsset,
              station_number: stationNumber,
              program: program,
              floor: floor,
              site: site
            })
          })
          .then(res => res.json())
          .then(res => {
            if (res.success) {
              const msg = alsoAddAsset ? "New storage item logged & registered as workstation asset!" : "New item logged into storage inventory.";
              showToast("Storage Item Saved", msg, "success");
              closeModal(modalAddStorage);
              formAddStorage.reset();
              if (storageAssetDetailsPanel) storageAssetDetailsPanel.style.display = 'none';
              fetchStorageFromDatabase();
            } else {
              showToast("Add Failed", res.message || "Failed to log item into storage.", "danger");
            }
          });
        });
      }

      /* ========================================================
         BULK IMPORT STORAGE ITEMS (Excel / CSV)
         ======================================================== */
      let storageBulkParsedData = [];

      const btnBulkStorage = document.getElementById('btn-bulk-storage');
      const dropZone = document.getElementById('storage-drop-zone');
      const fileInput = document.getElementById('storage-excel-file-input');
      const fileInfo = document.getElementById('storage-selected-file-info');
      const fileNameEl = document.getElementById('storage-selected-file-name');
      const fileSizeEl = document.getElementById('storage-selected-file-size');
      const previewContainer = document.getElementById('storage-bulk-preview-container');
      const previewBody = document.getElementById('storage-bulk-preview-body');
      const bulkCountEl = document.getElementById('storage-bulk-count');
      const btnClearBulkSelection = document.getElementById('btn-clear-bulk-selection');
      const btnConfirmBulkImport = document.getElementById('btn-confirm-bulk-import');
      const btnConfirmBulkText = document.getElementById('btn-confirm-bulk-text');

      function resetBulkStorageModal() {
        storageBulkParsedData = [];
        if (fileInput) fileInput.value = '';
        if (fileInfo) fileInfo.style.display = 'none';
        if (previewContainer) previewContainer.style.display = 'none';
        if (previewBody) previewBody.innerHTML = '';
        if (bulkCountEl) bulkCountEl.textContent = '0';
        if (btnConfirmBulkImport) {
          btnConfirmBulkImport.disabled = true;
          btnConfirmBulkImport.style.cursor = 'not-allowed';
          btnConfirmBulkImport.style.opacity = '0.6';
        }
        if (btnConfirmBulkText) btnConfirmBulkText.textContent = 'Select Excel File';
      }

      if (btnBulkStorage && modalBulkStorage) {
        btnBulkStorage.addEventListener('click', () => {
          resetBulkStorageModal();
          openModal(modalBulkStorage);
        });
      }

      if (btnFooterBulkStorage && modalBulkStorage) {
        btnFooterBulkStorage.addEventListener('click', () => {
          resetBulkStorageModal();
          openModal(modalBulkStorage);
        });
      }

      if (btnClearBulkSelection) {
        btnClearBulkSelection.addEventListener('click', () => {
          resetBulkStorageModal();
        });
      }

      // Sample template data
      const sampleStorageRows = [
        {
          "Asset Type": "Monitor",
          "Brand": "HP",
          "Model": "ProDisplay P201",
          "Serial Number": "3CQ4210W7V",
          "Storage Location": "Main Storage Room",
          "Status": "In Storage",
          "Operator": "Dominic Carreon"
        },
        {
          "Asset Type": "CPU",
          "Brand": "Dell",
          "Model": "OptiPlex 7050",
          "Serial Number": "8B9X123",
          "Storage Location": "Cabinet B-2",
          "Status": "Working",
          "Operator": "Dominic Carreon"
        },
        {
          "Asset Type": "Monitor",
          "Brand": "Samsung",
          "Model": "S22E390H",
          "Serial Number": "0LU4HTKQ100216B",
          "Storage Location": "Main Storage Room",
          "Status": "In Storage",
          "Operator": "Dominic Carreon"
        }
      ];

      function triggerDownloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      const btnDlXlsx = document.getElementById('btn-download-storage-template-xlsx');
      const btnDlCsv = document.getElementById('btn-download-storage-template-csv');

      function generateCsvTemplate() {
        const headers = ["Asset Type", "Brand", "Model", "Serial Number", "Storage Location", "Status", "Operator"];
        let csv = headers.join(",") + "\r\n";
        sampleStorageRows.forEach(item => {
          csv += [
            `"${item["Asset Type"]}"`,
            `"${item["Brand"]}"`,
            `"${item["Model"]}"`,
            `"${item["Serial Number"]}"`,
            `"${item["Storage Location"]}"`,
            `"${item["Status"]}"`,
            `"${item["Operator"]}"`
          ].join(",") + "\r\n";
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        triggerDownloadBlob(blob, "storage_bulk_import_template.csv");
        showToast("Template Downloaded", "Sample CSV template downloaded successfully.", "success");
      }

      if (btnDlXlsx) {
        btnDlXlsx.addEventListener('click', () => {
          if (window.XLSX) {
            try {
              const ws = XLSX.utils.json_to_sheet(sampleStorageRows);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Storage_Template");
              XLSX.writeFile(wb, "storage_bulk_import_template.xlsx");
              showToast("Template Downloaded", "Sample Excel file (.xlsx) downloaded successfully.", "success");
            } catch (ex) {
              generateCsvTemplate();
            }
          } else {
            generateCsvTemplate();
          }
        });
      }

      if (btnDlCsv) {
        btnDlCsv.addEventListener('click', () => {
          generateCsvTemplate();
        });
      }

      // Dropzone & File Input Handlers
      if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
          dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropZone.classList.remove('dragover');
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleSelectedBulkFile(e.dataTransfer.files[0]);
          }
        });

        fileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleSelectedBulkFile(e.target.files[0]);
          }
        });
      }

      function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
      }

      function handleSelectedBulkFile(file) {
        const validExts = ['.xlsx', '.xls', '.csv'];
        const fileName = file.name;
        const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

        if (!validExts.includes(ext)) {
          showToast("Unsupported File", "Please choose a valid Excel (.xlsx, .xls) or CSV (.csv) file.", "danger");
          return;
        }

        if (fileNameEl) fileNameEl.textContent = fileName;
        if (fileSizeEl) fileSizeEl.textContent = `(${formatFileSize(file.size)})`;
        if (fileInfo) fileInfo.style.display = 'flex';

        const reader = new FileReader();

        if (ext === '.csv' && !window.XLSX) {
          reader.onload = (e) => {
            parseCsvText(e.target.result);
          };
          reader.readAsText(file);
        } else {
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
              processParsedJson(rawJson);
            } catch (err) {
              showToast("Parse Error", "Could not parse Excel spreadsheet: " + err.message, "danger");
            }
          };
          reader.readAsArrayBuffer(file);
        }
      }

      function cleanColName(str) {
        return (str || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
      }

      function processParsedJson(rawRows) {
        if (!rawRows || rawRows.length === 0) {
          showToast("Empty File", "No data rows detected in the uploaded file.", "danger");
          resetBulkStorageModal();
          return;
        }

        const normalizedItems = [];

        rawRows.forEach(row => {
          const mapped = {};
          Object.keys(row).forEach(k => {
            const cleanKey = cleanColName(k);
            mapped[cleanKey] = row[k];
          });

          const findVal = (aliases) => {
            for (const alias of aliases) {
              if (mapped[alias] !== undefined && mapped[alias] !== '') {
                return String(mapped[alias]).trim();
              }
            }
            for (const k of Object.keys(mapped)) {
              for (const alias of aliases) {
                if (k.includes(alias) && mapped[k] !== '') {
                  return String(mapped[k]).trim();
                }
              }
            }
            return '';
          };

          const assetType = findVal(['assettype', 'type', 'typeofasset', 'category']) || 'General';
          const brand = findVal(['brand', 'manufacturer', 'make', 'brandofasset']) || 'Unknown';
          const model = findVal(['model', 'modelofasset', 'modelname']) || 'Standard';
          const serial = findVal(['serialnumber', 'serial', 'serialno', 'sn', 'tag', 'tagno', 'assetid']) || '';
          const location = findVal(['storagelocation', 'location', 'room', 'shelf', 'cabinet']) || '';
          const qtyVal = parseInt(findVal(['quantity', 'qty', 'count', 'amount'])) || 1;
          const status = findVal(['status', 'condition', 'state']) || '';
          const operator = findVal(['operator', 'user', 'username', 'addedby', 'tech']) || '';

          if (serial || model !== 'Standard' || brand !== 'Unknown' || assetType !== 'General') {
            normalizedItems.push({
              asset_type: assetType,
              brand: brand,
              model: model,
              serial_number: serial,
              location: location,
              quantity: qtyVal,
              status: status,
              operator: operator
            });
          }
        });

        if (normalizedItems.length === 0) {
          showToast("No Valid Rows", "Could not detect any valid equipment rows in this file.", "danger");
          resetBulkStorageModal();
          return;
        }

        storageBulkParsedData = normalizedItems;
        renderBulkPreview(normalizedItems);
      }

      function parseCsvText(csvText) {
        const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
          showToast("Empty CSV", "The CSV file does not contain enough data rows.", "danger");
          return;
        }
        const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
        const rawJson = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.replace(/^["']|["']$/g, '').trim());
          const obj = {};
          headers.forEach((h, idx) => {
            obj[h] = vals[idx] || '';
          });
          rawJson.push(obj);
        }
        processParsedJson(rawJson);
      }

      function renderBulkPreview(items) {
        if (!previewBody || !previewContainer) return;
        previewBody.innerHTML = '';

        const defaultLoc = document.getElementById('bulk-default-location')?.value || 'Main Storage Room';
        const defaultStat = document.getElementById('bulk-default-status')?.value || 'In Storage';

        const displayItems = items.slice(0, 50);

        displayItems.forEach((item, index) => {
          const tr = document.createElement('tr');
          const loc = item.location || defaultLoc;
          const stat = item.status || defaultStat;
          const serialDisplay = item.serial_number || '<em style="color: #94A3B8;">(Auto Tag)</em>';

          tr.innerHTML = `
            <td style="color: #64748B;">${index + 1}</td>
            <td><strong>${htmlspecialchars(item.asset_type)}</strong></td>
            <td>${htmlspecialchars(item.brand)}</td>
            <td>${htmlspecialchars(item.model)}</td>
            <td><code style="background: rgba(0, 61, 91, 0.08); padding: 2px 6px; border-radius: 4px; font-weight: 600;">${serialDisplay}</code></td>
            <td><span style="font-size: 11px; background: rgba(37, 226, 204, 0.15); color: #00665E; padding: 2px 6px; border-radius: 4px;">${htmlspecialchars(loc)}</span></td>
            <td><span style="font-size: 11px; padding: 2px 8px; border-radius: 10px; background: #E2ECEB; color: #003D5B;">${htmlspecialchars(stat)}</span></td>
          `;
          previewBody.appendChild(tr);
        });

        if (items.length > 50) {
          const trMore = document.createElement('tr');
          trMore.innerHTML = `
            <td colspan="7" style="text-align: center; color: #64748B; font-style: italic; background: #F8FAFC;">
              ... and ${items.length - 50} more records ready for import.
            </td>
          `;
          previewBody.appendChild(trMore);
        }

        if (bulkCountEl) bulkCountEl.textContent = items.length;
        previewContainer.style.display = 'block';

        if (btnConfirmBulkImport) {
          btnConfirmBulkImport.disabled = false;
          btnConfirmBulkImport.style.cursor = 'pointer';
          btnConfirmBulkImport.style.opacity = '1';
        }
        if (btnConfirmBulkText) {
          btnConfirmBulkText.textContent = `Import ${items.length} Item${items.length > 1 ? 's' : ''}`;
        }
        if (window.lucide) window.lucide.createIcons();
      }

      // Execute Bulk Import Submission
      if (btnConfirmBulkImport) {
        btnConfirmBulkImport.addEventListener('click', () => {
          if (!storageBulkParsedData || storageBulkParsedData.length === 0) {
            showToast("No Data", "Please select a valid Excel or CSV file first.", "danger");
            return;
          }

          const defaultLocation = document.getElementById('bulk-default-location')?.value || 'Main Storage Room';
          const defaultStatus = document.getElementById('bulk-default-status')?.value || 'In Storage';
          const defaultOperator = document.getElementById('bulk-default-operator')?.value || 'Dominic Carreon';

          btnConfirmBulkImport.disabled = true;
          btnConfirmBulkImport.style.opacity = '0.7';
          if (btnConfirmBulkText) btnConfirmBulkText.textContent = "Importing...";

          fetch('api.php?action=bulk_add_storage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: storageBulkParsedData,
              default_location: defaultLocation,
              default_status: defaultStatus,
              default_operator: defaultOperator
            })
          })
          .then(res => res.json())
          .then(res => {
            if (res.success) {
              showToast("Bulk Import Completed", res.message || `Successfully imported ${res.count || storageBulkParsedData.length} items.`, "success");
              closeModal(modalBulkStorage);
              resetBulkStorageModal();
              fetchStorageFromDatabase();
            } else {
              showToast("Import Failed", res.message || "Failed to import items into storage.", "danger");
              btnConfirmBulkImport.disabled = false;
              btnConfirmBulkImport.style.opacity = '1';
              if (btnConfirmBulkText) {
                btnConfirmBulkText.textContent = `Import ${storageBulkParsedData.length} Items`;
              }
            }
          })
          .catch(err => {
            showToast("Network Error", "Could not complete bulk import request: " + err.message, "danger");
            btnConfirmBulkImport.disabled = false;
            btnConfirmBulkImport.style.opacity = '1';
            if (btnConfirmBulkText) {
              btnConfirmBulkText.textContent = `Import ${storageBulkParsedData.length} Items`;
            }
          });
        });
      }

      // Sorting handler for storage
      document.querySelectorAll('th[data-sort-storage]').forEach(th => {
        th.addEventListener('click', () => {
          const dbCol = th.getAttribute('data-sort-storage');

          document.querySelectorAll('th[data-sort-storage]').forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
            const ind = header.querySelector('.sort-indicator-storage');
            if (ind) ind.textContent = '';
          });

          if (storageSortColumn === dbCol) {
            storageSortOrder = storageSortOrder === 'asc' ? 'desc' : 'asc';
          } else {
            storageSortColumn = dbCol;
            storageSortOrder = 'asc';
          }

          th.classList.add(storageSortOrder === 'asc' ? 'sorted-asc' : 'sorted-desc');
          const ind = th.querySelector('.sort-indicator-storage');
          if (ind) ind.textContent = storageSortOrder === 'asc' ? ' ▲' : ' ▼';
          renderStorageTable();
        });
      });

      // Initial storage load
      fetchStorageFromDatabase();
    } else {
      const btnGotoInventory = document.getElementById('btn-goto-inventory');
      if (btnGotoInventory) {
        btnGotoInventory.addEventListener('click', () => {
          window.location.href = 'dashboard.php?view=inventory';
        });
      }

      const assetBulkColumns = [
        'Station_Number', 'CPU_Model', 'CPU_Serial', 'CPU_Brand',
        'Monitor1_Model', 'Monitor1_Serial', 'Monitor1_Brand',
        'Monitor2_Model', 'Monitor2_Serial', 'Monitor2_Brand',
        'Monitor3_Model', 'Monitor3_Serial', 'Monitor3_Brand',
        'Program', 'Asset_located_floor', 'Site', 'Current_Status'
      ];
      const assetBulkLabels = assetBulkColumns.map(column => column.replace(/_/g, ' '));
      const btnBulkAssets = document.getElementById('btn-bulk-assets');
      const assetsDropZone = document.getElementById('assets-drop-zone');
      const assetsFileInput = document.getElementById('assets-excel-file-input');
      const assetsFileInfo = document.getElementById('assets-selected-file-info');
      const assetsFileName = document.getElementById('assets-selected-file-name');
      const assetsFileSize = document.getElementById('assets-selected-file-size');
      const assetsPreview = document.getElementById('assets-bulk-preview-container');
      const assetsPreviewHead = document.getElementById('assets-bulk-preview-head');
      const assetsPreviewBody = document.getElementById('assets-bulk-preview-body');
      const assetsCount = document.getElementById('assets-bulk-count');
      const btnConfirmAssets = document.getElementById('btn-confirm-bulk-assets');
      const btnConfirmAssetsText = document.getElementById('btn-confirm-bulk-assets-text');
      let assetBulkRows = [];

      const resetAssetBulk = () => {
        assetBulkRows = [];
        if (assetsFileInput) assetsFileInput.value = '';
        if (assetsFileInfo) assetsFileInfo.style.display = 'none';
        if (assetsPreview) assetsPreview.style.display = 'none';
        if (assetsPreviewBody) assetsPreviewBody.innerHTML = '';
        if (assetsCount) assetsCount.textContent = '0';
        if (btnConfirmAssets) {
          btnConfirmAssets.disabled = true;
          btnConfirmAssets.style.opacity = '0.6';
          btnConfirmAssetsText.textContent = 'Select Excel File';
        }
      };

      const assetTemplateRows = [{
        Station_Number: 101, CPU_Model: 'ProDesk 600 G3', CPU_Serial: 'CPU-0001', CPU_Brand: 'HP',
        Monitor1_Model: 'EliteDisplay E232', Monitor1_Serial: 'MON-0001', Monitor1_Brand: 'HP',
        Monitor2_Model: '', Monitor2_Serial: '', Monitor2_Brand: '',
        Monitor3_Model: '', Monitor3_Serial: '', Monitor3_Brand: '',
        Program: 'Macys', Asset_located_floor: '4th', Site: 'UP2', Current_Status: 'Onsite Deployed'
      }];
      const formatAssetFileSize = bytes => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
      const downloadAssetBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      };

      const downloadAssetTemplate = (xlsx) => {
        if (xlsx && window.XLSX) {
          const worksheet = XLSX.utils.json_to_sheet(assetTemplateRows, { header: assetBulkColumns });
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets_Template');
          XLSX.writeFile(workbook, 'wall_to_wall_assets_template.xlsx');
          showToast('Template Downloaded', 'Excel asset template downloaded successfully.', 'success');
          return;
        }
        const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const csv = assetBulkColumns.join(',') + '\r\n' +
          assetTemplateRows.map(row => assetBulkColumns.map(column => escapeCsv(row[column])).join(',')).join('\r\n') + '\r\n';
        downloadAssetBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'wall_to_wall_assets_template.csv');
        showToast('Template Downloaded', 'CSV asset template downloaded successfully.', 'success');
      };

      document.getElementById('btn-download-assets-template-xlsx')?.addEventListener('click', () => downloadAssetTemplate(true));
      document.getElementById('btn-download-assets-template-csv')?.addEventListener('click', () => downloadAssetTemplate(false));

      const normalizeAssetRows = rawRows => {
        const rows = [];
        rawRows.forEach((source, index) => {
          const normalized = {};
          Object.keys(source).forEach(key => {
            normalized[key.toLowerCase().replace(/[^a-z0-9]/g, '')] = source[key];
          });
          const value = column => {
            const key = column.toLowerCase().replace(/[^a-z0-9]/g, '');
            return String(normalized[key] ?? '').trim();
          };
          const row = {};
          assetBulkColumns.forEach(column => { row[column] = value(column); });
          if (!row.Station_Number) throw new Error(`Row ${index + 2} is missing Station_Number.`);
          if (!/^\d+$/.test(row.Station_Number) || Number(row.Station_Number) <= 0) {
            throw new Error(`Row ${index + 2} has an invalid Station_Number.`);
          }
          const primarySerial = row.CPU_Serial || row.Monitor1_Serial || row.Monitor2_Serial || row.Monitor3_Serial;
          if (!primarySerial) {
            throw new Error(`Row ${index + 2} must include CPU_Serial or a monitor serial number.`);
          }
          row.Station_Number = Number(row.Station_Number);
          row.Current_Status = row.Current_Status || 'Onsite Deployed';
          rows.push(row);
        });
        const seen = new Set();
        const seenSerials = new Set();
        rows.forEach(row => {
          if (seen.has(row.Station_Number)) throw new Error(`Station_Number ${row.Station_Number} appears more than once.`);
          seen.add(row.Station_Number);
          const primarySerial = row.CPU_Serial || row.Monitor1_Serial || row.Monitor2_Serial || row.Monitor3_Serial;
          if (seenSerials.has(primarySerial)) throw new Error(`Serial number ${primarySerial} appears more than once.`);
          seenSerials.add(primarySerial);
        });
        return rows;
      };

      const renderAssetBulkPreview = rows => {
        assetsPreviewHead.innerHTML = assetBulkLabels.map(label => `<th style="padding: 6px 10px; white-space: nowrap;">${htmlspecialchars(label)}</th>`).join('');
        assetsPreviewBody.innerHTML = rows.slice(0, 50).map(row =>
          `<tr>${assetBulkColumns.map(column => `<td style="padding: 6px 10px; white-space: nowrap;">${htmlspecialchars(row[column])}</td>`).join('')}</tr>`
        ).join('');
        if (rows.length > 50) {
          assetsPreviewBody.insertAdjacentHTML('beforeend', `<tr><td colspan="${assetBulkColumns.length}" style="text-align:center;">... and ${rows.length - 50} more records</td></tr>`);
        }
        assetsCount.textContent = rows.length;
        assetsPreview.style.display = 'block';
        btnConfirmAssets.disabled = false;
        btnConfirmAssets.style.opacity = '1';
        btnConfirmAssetsText.textContent = `Import ${rows.length} Asset${rows.length === 1 ? '' : 's'}`;
      };

      const handleAssetFile = file => {
        const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (!['.xlsx', '.xls', '.csv'].includes(extension)) {
          showToast('Unsupported File', 'Please choose an Excel (.xlsx, .xls) or CSV (.csv) file.', 'danger');
          return;
        }
        assetsFileName.textContent = file.name;
        assetsFileSize.textContent = `(${formatAssetFileSize(file.size)})`;
        assetsFileInfo.style.display = 'block';
        const reader = new FileReader();
        reader.onload = event => {
          try {
            let rawRows;
            if (extension === '.csv' && !window.XLSX) {
              const lines = String(event.target.result).split(/\r\n|\n/).filter(line => line.trim());
              const headers = lines.shift().split(',').map(header => header.replace(/^["']|["']$/g, '').trim());
              rawRows = lines.map(line => {
                const values = line.split(',').map(value => value.replace(/^["']|["']$/g, '').trim());
                return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
              });
            } else {
              const workbook = XLSX.read(new Uint8Array(event.target.result), { type: 'array' });
              rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
            }
            assetBulkRows = normalizeAssetRows(rawRows);
            renderAssetBulkPreview(assetBulkRows);
          } catch (error) {
            resetAssetBulk();
            showToast('Import Validation Failed', error.message, 'danger');
          }
        };
        reader.onerror = () => showToast('File Read Error', 'Could not read the selected file.', 'danger');
        if (extension === '.csv' && !window.XLSX) reader.readAsText(file);
        else reader.readAsArrayBuffer(file);
      };

      if (btnBulkAssets && modalBulkAssets) {
        btnBulkAssets.addEventListener('click', () => { resetAssetBulk(); openModal(modalBulkAssets); });
      }
      if (assetsDropZone && assetsFileInput) {
        assetsDropZone.addEventListener('click', () => assetsFileInput.click());
        assetsDropZone.addEventListener('dragover', event => { event.preventDefault(); });
        assetsDropZone.addEventListener('drop', event => {
          event.preventDefault();
          if (event.dataTransfer.files.length) handleAssetFile(event.dataTransfer.files[0]);
        });
        assetsFileInput.addEventListener('change', event => {
          if (event.target.files.length) handleAssetFile(event.target.files[0]);
        });
      }
      btnConfirmAssets?.addEventListener('click', () => {
        if (!assetBulkRows.length) return;
        btnConfirmAssets.disabled = true;
        btnConfirmAssetsText.textContent = 'Importing...';
        fetch('api.php?action=bulk_add_assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: assetBulkRows })
        }).then(response => response.json()).then(result => {
          if (!result.success) throw new Error(result.message || 'The asset batch could not be imported.');
          showToast('Bulk Import Completed', result.message, 'success');
          closeModal(modalBulkAssets);
          resetAssetBulk();
          fetchAssetsFromDatabase();
        }).catch(error => {
          btnConfirmAssets.disabled = false;
          btnConfirmAssetsText.textContent = `Import ${assetBulkRows.length} Assets`;
          showToast('Import Failed', error.message, 'danger');
        });
      });

      // Initial assets load on document ready
      fetchAssetsFromDatabase();
    }

  }

});
