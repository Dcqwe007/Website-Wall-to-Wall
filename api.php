<?php
// Start native PHP session
session_start();

// Disable error display in raw output to avoid corrupting JSON parsing
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Import database connector
require_once 'db.php';

// Route action parameter
$action = $_GET['action'] ?? 'fetch';

// If the action is read-only (not login or logout), release the session lock early to allow concurrent AJAX requests
if ($action !== 'login' && $action !== 'logout') {
    session_write_close();
}

// Read JSON input payloads
$inputData = json_decode(file_get_contents('php://input'), true) ?? [];

// Establish database link
$db = getDBConnection();

/**
 * Helper to log edit history events.
 */
function log_edit_history($db, $station_number, $action_type, $details) {
    try {
        $username = $_SESSION['aether_username'] ?? 'System';
        $logStmt = $db->prepare("INSERT INTO edit_history (station_number, action_type, username, details, changed_at) VALUES (:station, :action, :username, :details, NOW())");
        $logStmt->execute([
            'station'  => intval($station_number),
            'action'   => $action_type,
            'username' => $username,
            'details'  => $details
        ]);
    } catch (Exception $e) {
        error_log("Failed to log edit history: " . $e->getMessage());
    }
}

/**
 * Clean up inventory table by removing any assets that are currently active in the assets table.
 */
function cleanup_inventory($db) {
    try {
        $db->exec("DELETE FROM inventory WHERE serial_number IS NOT NULL AND serial_number != '' AND serial_number != 'N/A' AND serial_number IN (
            SELECT CPU_Serial FROM assets WHERE CPU_Serial IS NOT NULL AND CPU_Serial != '' AND CPU_Serial != 'N/A'
            UNION
            SELECT Monitor1_Serial FROM assets WHERE Monitor1_Serial IS NOT NULL AND Monitor1_Serial != '' AND Monitor1_Serial != 'N/A'
            UNION
            SELECT Monitor2_Serial FROM assets WHERE Monitor2_Serial IS NOT NULL AND Monitor2_Serial != '' AND Monitor2_Serial != 'N/A'
            UNION
            SELECT Monitor3_Serial FROM assets WHERE Monitor3_Serial IS NOT NULL AND Monitor3_Serial != '' AND Monitor3_Serial != 'N/A'
        )");
    } catch (Exception $e) {
        error_log("Failed to clean up inventory: " . $e->getMessage());
    }
}

try {
    switch ($action) {
        
        // --------------------------------------------------------
        // ACTION: LOGIN AUTHENTICATION
        // --------------------------------------------------------
        case 'login':
            $loginInput = trim($inputData['email'] ?? ''); // Maps to email OR username
            $password = $inputData['password'] ?? '';

            if (empty($loginInput) || empty($password)) {
                echo json_encode(['success' => false, 'message' => 'Please fill in all fields.']);
                exit;
            }

            // Query by email OR username matching user screenshots
            $stmt = $db->prepare("SELECT * FROM users WHERE email = :login1 OR username = :login2 LIMIT 1");
            $stmt->execute(['login1' => $loginInput, 'login2' => $loginInput]);
            $user = $stmt->fetch();

            if ($user) {
                // Verify using standard bcrypt hash, fallback to plain text for XAMPP mock ease
                $pwdCorrect = password_verify($password, $user['password_hash']) || ($password === $user['password_hash']);
                
                if ($pwdCorrect) {
                    if (isset($user['status']) && strtolower($user['status']) !== 'active') {
                        echo json_encode(['success' => false, 'message' => 'Your account status is inactive.']);
                        exit;
                    }
                    
                    // Set secure session keys
                    $_SESSION['aether_session_token'] = 'token_' . bin2hex(random_bytes(16));
                    $_SESSION['aether_username'] = $user['username'];
                    
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Incorrect password.']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Username or email not found.']);
            }
            break;

        // --------------------------------------------------------
        // ACTION: USER SIGN UP
        // --------------------------------------------------------
        case 'signup':
            $username = trim($inputData['username'] ?? '');
            $email = trim($inputData['email'] ?? '');
            $password = $inputData['password'] ?? '';
            $confirmPassword = $inputData['confirm_password'] ?? '';

            if (empty($username) || empty($email) || empty($password) || empty($confirmPassword)) {
                echo json_encode(['success' => false, 'message' => 'Please fill in all registration fields.']);
                exit;
            }

            if ($password !== $confirmPassword) {
                echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
                exit;
            }

            // Check if username already exists
            $checkUser = $db->prepare("SELECT COUNT(*) FROM users WHERE username = :username");
            $checkUser->execute(['username' => $username]);
            if ($checkUser->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'Username is already taken.']);
                exit;
            }

            // Check if email already exists
            $checkEmail = $db->prepare("SELECT COUNT(*) FROM users WHERE email = :email");
            $checkEmail->execute(['email' => $email]);
            if ($checkEmail->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'Email address is already registered.']);
                exit;
            }

            // Hash password securely using standard PHP bcrypt
            $pwdHash = password_hash($password, PASSWORD_BCRYPT);

            // Insert new user record
            $sql = "INSERT INTO users (username, password_hash, email, status, created_at) 
                    VALUES (:username, :password_hash, :email, 'Active', NOW())";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                'username'      => $username,
                'password_hash' => $pwdHash,
                'email'         => $email
            ]);

            echo json_encode(['success' => true]);
            break;

        // --------------------------------------------------------
        // ACTION: LOGOUT
        // --------------------------------------------------------
        case 'logout':
            $_SESSION = [];
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            session_destroy();
            echo json_encode(['success' => true]);
            break;

        // --------------------------------------------------------
        // ACTION: FETCH ASSETS
        // --------------------------------------------------------
        case 'fetch':
            // Check active session guard
            if (!isset($_SESSION['aether_session_token'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized session access.']);
                exit;
            }

            $stmt = $db->query("SELECT * FROM assets");
            $rows = $stmt->fetchAll();
            
            // Map table headers dynamically for JS rendering
            echo json_encode(['success' => true, 'data' => $rows]);
            break;

        // --------------------------------------------------------
        // ACTION: ADD ASSET
        // --------------------------------------------------------
        case 'add':
            if (!isset($_SESSION['aether_session_token'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized session access.']);
                exit;
            }

            $stationNum = intval($inputData['Station_Number'] ?? 0);

            // Check if Station_Number already exists
            $checkStmt = $db->prepare("SELECT COUNT(*) FROM assets WHERE Station_Number = :station");
            $checkStmt->execute(['station' => $stationNum]);
            if ($checkStmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'Station Number ' . $stationNum . ' already exists.']);
                exit;
            }

            $sql = "INSERT INTO assets (
                        Station_Number, CPU_Model, CPU_Serial, CPU_Brand,
                        Monitor1_Model, Monitor1_Serial, Monitor1_Brand,
                        Monitor2_Model, Monitor2_Serial, Monitor2_Brand,
                        Monitor3_Model, Monitor3_Serial, Monitor3_Brand,
                        Program, Asset_located_floor, Site, Current_Status, Created_Date
                    ) VALUES (
                        :Station_Number, :CPU_Model, :CPU_Serial, :CPU_Brand,
                        :Monitor1_Model, :Monitor1_Serial, :Monitor1_Brand,
                        :Monitor2_Model, :Monitor2_Serial, :Monitor2_Brand,
                        :Monitor3_Model, :Monitor3_Serial, :Monitor3_Brand,
                        :Program, :Asset_located_floor, :Site, :Current_Status, NOW()
                    )";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                'Station_Number'      => $stationNum,
                'CPU_Model'           => trim($inputData['CPU_Model'] ?? ''),
                'CPU_Serial'          => trim($inputData['CPU_Serial'] ?? ''),
                'CPU_Brand'           => trim($inputData['CPU_Brand'] ?? ''),
                'Monitor1_Model'      => trim($inputData['Monitor1_Model'] ?? ''),
                'Monitor1_Serial'     => trim($inputData['Monitor1_Serial'] ?? ''),
                'Monitor1_Brand'      => trim($inputData['Monitor1_Brand'] ?? ''),
                'Monitor2_Model'      => trim($inputData['Monitor2_Model'] ?? ''),
                'Monitor2_Serial'     => trim($inputData['Monitor2_Serial'] ?? ''),
                'Monitor2_Brand'      => trim($inputData['Monitor2_Brand'] ?? ''),
                'Monitor3_Model'      => trim($inputData['Monitor3_Model'] ?? ''),
                'Monitor3_Serial'     => trim($inputData['Monitor3_Serial'] ?? ''),
                'Monitor3_Brand'      => trim($inputData['Monitor3_Brand'] ?? ''),
                'Program'             => trim($inputData['Program'] ?? ''),
                'Asset_located_floor' => trim($inputData['Asset_located_floor'] ?? ''),
                'Site'                => trim($inputData['Site'] ?? ''),
                'Current_Status'      => trim($inputData['Current_Status'] ?? 'Onsite Deployed')
            ]);

            // Log history event
            $cpuModel = trim($inputData['CPU_Model'] ?? '');
            $cpuSerial = trim($inputData['CPU_Serial'] ?? '');
            log_edit_history($db, $stationNum, 'Add', "Asset added (CPU Model: '$cpuModel', CPU Serial: '$cpuSerial')");

            // Clean up active assets from inventory
            cleanup_inventory($db);

            echo json_encode(['success' => true]);
            break;

        // --------------------------------------------------------
        // ACTION: EDIT ASSET
        // --------------------------------------------------------
        case 'edit':
            if (!isset($_SESSION['aether_session_token'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized session access.']);
                exit;
            }

            $oldStation = intval($inputData['old_Station_Number'] ?? 0);
            $newStation = intval($inputData['Station_Number'] ?? 0);

            // If renaming Station_Number, check target doesn't already exist
            if ($oldStation !== $newStation) {
                $checkStmt = $db->prepare("SELECT COUNT(*) FROM assets WHERE Station_Number = :station");
                $checkStmt->execute(['station' => $newStation]);
                if ($checkStmt->fetchColumn() > 0) {
                    echo json_encode(['success' => false, 'message' => 'Station Number ' . $newStation . ' is already taken by another record.']);
                    exit;
                }
            }

            // Retrieve old asset for change comparison
            $oldAssetStmt = $db->prepare("SELECT * FROM assets WHERE Station_Number = :station");
            $oldAssetStmt->execute(['station' => $oldStation]);
            $oldAsset = $oldAssetStmt->fetch();

            // Track replaced components and check for swaps
            $swappedSerials = [];
            if ($oldAsset) {
                $components = [
                    'CPU'       => ['Model' => 'CPU_Model', 'Serial' => 'CPU_Serial', 'Brand' => 'CPU_Brand'],
                    'Monitor 1' => ['Model' => 'Monitor1_Model', 'Serial' => 'Monitor1_Serial', 'Brand' => 'Monitor1_Brand'],
                    'Monitor 2' => ['Model' => 'Monitor2_Model', 'Serial' => 'Monitor2_Serial', 'Brand' => 'Monitor2_Brand'],
                    'Monitor 3' => ['Model' => 'Monitor3_Model', 'Serial' => 'Monitor3_Serial', 'Brand' => 'Monitor3_Brand']
                ];

                foreach ($components as $type => $fields) {
                    $oldSerial = isset($oldAsset[$fields['Serial']]) ? trim($oldAsset[$fields['Serial']]) : '';
                    $newSerial = isset($inputData[$fields['Serial']]) ? trim($inputData[$fields['Serial']]) : '';
                    
                    if ($oldSerial !== $newSerial && $newSerial !== '' && $newSerial !== 'N/A') {
                        // Check if $newSerial is currently assigned to another station
                        $swapCheck = $db->prepare("
                            SELECT Station_Number, CPU_Model, CPU_Serial, CPU_Brand,
                                   Monitor1_Model, Monitor1_Serial, Monitor1_Brand,
                                   Monitor2_Model, Monitor2_Serial, Monitor2_Brand,
                                   Monitor3_Model, Monitor3_Serial, Monitor3_Brand
                            FROM assets 
                            WHERE (CPU_Serial = :serial1 OR Monitor1_Serial = :serial2 OR Monitor2_Serial = :serial3 OR Monitor3_Serial = :serial4)
                              AND Station_Number != :station
                            LIMIT 1
                        ");
                        $swapCheck->execute([
                            'serial1' => $newSerial,
                            'serial2' => $newSerial,
                            'serial3' => $newSerial,
                            'serial4' => $newSerial,
                            'station' => $oldStation
                        ]);
                        $otherStation = $swapCheck->fetch();
                        
                        if ($otherStation) {
                            $otherStationNum = intval($otherStation['Station_Number']);
                            
                            // Find which column had the serial on the other station
                            $otherColType = null;
                            if (trim($otherStation['CPU_Serial']) === $newSerial) {
                                $otherColType = 'CPU';
                            } elseif (trim($otherStation['Monitor1_Serial']) === $newSerial) {
                                $otherColType = 'Monitor 1';
                            } elseif (trim($otherStation['Monitor2_Serial']) === $newSerial) {
                                $otherColType = 'Monitor 2';
                            } elseif (trim($otherStation['Monitor3_Serial']) === $newSerial) {
                                $otherColType = 'Monitor 3';
                            }
                            
                            if ($otherColType) {
                                $otherFields = $components[$otherColType];
                                
                                // Swap: update the other station's matching component to the old component of the current station
                                $oldModel = isset($oldAsset[$fields['Model']]) ? trim($oldAsset[$fields['Model']]) : '';
                                $oldBrand = isset($oldAsset[$fields['Brand']]) ? trim($oldAsset[$fields['Brand']]) : '';
                                
                                $updateOther = $db->prepare("
                                    UPDATE assets 
                                    SET {$otherFields['Model']} = :model,
                                        {$otherFields['Serial']} = :serial,
                                        {$otherFields['Brand']} = :brand,
                                        Modified_Date = NOW()
                                    WHERE Station_Number = :station
                                ");
                                $updateOther->execute([
                                    'model'   => $oldModel,
                                    'serial'  => $oldSerial,
                                    'brand'   => $oldBrand,
                                    'station' => $otherStationNum
                                ]);
                                
                                // Track as swapped so we don't insert into inventory
                                if ($oldSerial !== '') {
                                    $swappedSerials[] = $oldSerial;
                                }
                                $swappedSerials[] = $newSerial;
                                
                                // Log history for the other station
                                log_edit_history(
                                    $db, 
                                    $otherStationNum, 
                                    'Edit (Auto Swap)', 
                                    "{$otherColType} swapped with Station {$oldStation} (Serial: '{$newSerial}' → '" . ($oldSerial === '' ? 'empty' : $oldSerial) . "')"
                                );
                            }
                        }
                    }
                }
            }

            $sql = "UPDATE assets SET 
                        Station_Number       = :Station_Number,
                        CPU_Model            = :CPU_Model,
                        CPU_Serial           = :CPU_Serial,
                        CPU_Brand            = :CPU_Brand,
                        Monitor1_Model       = :Monitor1_Model,
                        Monitor1_Serial      = :Monitor1_Serial,
                        Monitor1_Brand       = :Monitor1_Brand,
                        Monitor2_Model       = :Monitor2_Model,
                        Monitor2_Serial      = :Monitor2_Serial,
                        Monitor2_Brand       = :Monitor2_Brand,
                        Monitor3_Model       = :Monitor3_Model,
                        Monitor3_Serial      = :Monitor3_Serial,
                        Monitor3_Brand       = :Monitor3_Brand,
                        Program              = :Program,
                        Asset_located_floor  = :Asset_located_floor,
                        Site                 = :Site,
                        Current_Status       = :Current_Status,
                        Modified_Date        = NOW()
                    WHERE Station_Number = :old_Station_Number";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                'Station_Number'      => $newStation,
                'CPU_Model'           => trim($inputData['CPU_Model'] ?? ''),
                'CPU_Serial'          => trim($inputData['CPU_Serial'] ?? ''),
                'CPU_Brand'           => trim($inputData['CPU_Brand'] ?? ''),
                'Monitor1_Model'      => trim($inputData['Monitor1_Model'] ?? ''),
                'Monitor1_Serial'     => trim($inputData['Monitor1_Serial'] ?? ''),
                'Monitor1_Brand'      => trim($inputData['Monitor1_Brand'] ?? ''),
                'Monitor2_Model'      => trim($inputData['Monitor2_Model'] ?? ''),
                'Monitor2_Serial'     => trim($inputData['Monitor2_Serial'] ?? ''),
                'Monitor2_Brand'      => trim($inputData['Monitor2_Brand'] ?? ''),
                'Monitor3_Model'      => trim($inputData['Monitor3_Model'] ?? ''),
                'Monitor3_Serial'     => trim($inputData['Monitor3_Serial'] ?? ''),
                'Monitor3_Brand'      => trim($inputData['Monitor3_Brand'] ?? ''),
                'Program'             => trim($inputData['Program'] ?? ''),
                'Asset_located_floor' => trim($inputData['Asset_located_floor'] ?? ''),
                'Site'                => trim($inputData['Site'] ?? ''),
                'Current_Status'      => trim($inputData['Current_Status'] ?? 'Onsite Deployed'),
                'old_Station_Number'  => $oldStation
            ]);

            // Track replaced components and auto-insert into inventory
            if ($oldAsset) {
                $components = [
                    'CPU'       => ['Model' => 'CPU_Model', 'Serial' => 'CPU_Serial', 'Brand' => 'CPU_Brand'],
                    'Monitor 1' => ['Model' => 'Monitor1_Model', 'Serial' => 'Monitor1_Serial', 'Brand' => 'Monitor1_Brand'],
                    'Monitor 2' => ['Model' => 'Monitor2_Model', 'Serial' => 'Monitor2_Serial', 'Brand' => 'Monitor2_Brand'],
                    'Monitor 3' => ['Model' => 'Monitor3_Model', 'Serial' => 'Monitor3_Serial', 'Brand' => 'Monitor3_Brand']
                ];

                foreach ($components as $type => $fields) {
                    $oldSerial = isset($oldAsset[$fields['Serial']]) ? trim($oldAsset[$fields['Serial']]) : '';
                    $newSerial = isset($inputData[$fields['Serial']]) ? trim($inputData[$fields['Serial']]) : '';
                    $oldModel  = isset($oldAsset[$fields['Model']]) ? trim($oldAsset[$fields['Model']]) : '';
                    $newModel  = isset($inputData[$fields['Model']]) ? trim($inputData[$fields['Model']]) : '';
                    $oldBrand  = isset($oldAsset[$fields['Brand']]) ? trim($oldAsset[$fields['Brand']]) : '';
                    $newBrand  = isset($inputData[$fields['Brand']]) ? trim($inputData[$fields['Brand']]) : '';

                    $hasChanged = ($oldSerial !== $newSerial) || ($oldModel !== $newModel) || ($oldBrand !== $newBrand);
                    $wasNotEmpty = ($oldSerial !== '') || ($oldModel !== '') || ($oldBrand !== '');

                    if ($hasChanged && $wasNotEmpty && !in_array($oldSerial, $swappedSerials)) {
                        // Map Monitor 1, 2, 3 to 'Monitor'
                        $mappedType = (strpos($type, 'Monitor') === 0) ? 'Monitor' : 'CPU';
                        $serialToInsert = ($oldSerial !== '') ? $oldSerial : 'N/A';

                        $invStmt = $db->prepare("INSERT INTO inventory (asset_type, model, serial_number, brand, previous_station, username, removed_at, status) 
                                                 VALUES (:type, :model, :serial, :brand, :station, :username, NOW(), 'On Inventory')");
                        $invStmt->execute([
                            'type'     => $mappedType,
                            'model'    => $oldModel,
                            'serial'   => $serialToInsert,
                            'brand'    => $oldBrand,
                            'station'  => $oldStation,
                            'username' => $_SESSION['aether_username'] ?? 'System'
                        ]);
                    }
                }
            }

            // Compare fields to log changes
            $changes = [];
            if ($oldAsset) {
                $fieldsToCompare = [
                    'Station_Number'      => 'Station Number',
                    'CPU_Model'           => 'CPU Model',
                    'CPU_Serial'          => 'CPU Serial',
                    'CPU_Brand'           => 'CPU Brand',
                    'Monitor1_Model'      => 'Monitor 1 Model',
                    'Monitor1_Serial'     => 'Monitor 1 Serial',
                    'Monitor1_Brand'      => 'Monitor 1 Brand',
                    'Monitor2_Model'      => 'Monitor 2 Model',
                    'Monitor2_Serial'     => 'Monitor 2 Serial',
                    'Monitor2_Brand'      => 'Monitor 2 Brand',
                    'Monitor3_Model'      => 'Monitor 3 Model',
                    'Monitor3_Serial'     => 'Monitor 3 Serial',
                    'Monitor3_Brand'      => 'Monitor 3 Brand',
                    'Program'             => 'Program',
                    'Asset_located_floor' => 'Floor',
                    'Site'                => 'Site',
                    'Current_Status'      => 'Status'
                ];

                foreach ($fieldsToCompare as $dbCol => $label) {
                    $oldVal = isset($oldAsset[$dbCol]) ? trim($oldAsset[$dbCol]) : '';
                    $newVal = isset($inputData[$dbCol]) ? trim($inputData[$dbCol]) : '';

                    if ($dbCol === 'Station_Number') {
                        $oldVal = intval($oldVal);
                        $newVal = intval($newVal);
                    }

                    if ($oldVal != $newVal) {
                        $changes[] = "$label: '" . ($oldVal === '' ? 'empty' : $oldVal) . "' → '" . ($newVal === '' ? 'empty' : $newVal) . "'";
                    }
                }
            }
            $details = count($changes) > 0 ? implode('; ', $changes) : 'No properties changed';
            log_edit_history($db, $newStation, 'Edit', $details);

            // Clean up active assets from inventory
            cleanup_inventory($db);

            echo json_encode(['success' => true]);
            break;

        // --------------------------------------------------------
        // ACTION: UPDATE STATUS QUICKLY
        // --------------------------------------------------------
        case 'status':
            if (!isset($_SESSION['aether_session_token'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized session access.']);
                exit;
            }

            $station = intval($inputData['Station_Number'] ?? 0);
            $status  = trim($inputData['Current_Status'] ?? 'Onsite Deployed');

            // Fetch old status for comparison
            $oldStatusStmt = $db->prepare("SELECT Current_Status FROM assets WHERE Station_Number = :station");
            $oldStatusStmt->execute(['station' => $station]);
            $oldStatus = $oldStatusStmt->fetchColumn();

            $stmt = $db->prepare("UPDATE assets SET Current_Status = :status, Modified_Date = NOW() WHERE Station_Number = :station");
            $stmt->execute(['status' => $status, 'station' => $station]);

            if ($oldStatus !== false && $oldStatus !== $status) {
                log_edit_history($db, $station, 'Status Update', "Status: '$oldStatus' → '$status'");
            }

            echo json_encode(['success' => true]);
            break;



        // --------------------------------------------------------
        // ACTION: DELETE ASSET
        // --------------------------------------------------------
        case 'delete':
            if (!isset($_SESSION['aether_session_token'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized session access.']);
                exit;
            }

            $station = intval($inputData['Station_Number'] ?? 0);

            // Fetch asset details before deletion for logging context
            $infoStmt = $db->prepare("SELECT CPU_Model, CPU_Serial FROM assets WHERE Station_Number = :station");
            $infoStmt->execute(['station' => $station]);
            $assetInfo = $infoStmt->fetch();

            $stmt = $db->prepare("DELETE FROM assets WHERE Station_Number = :station");
            $stmt->execute(['station' => $station]);

            if ($assetInfo) {
                $details = "Asset deleted (CPU Model: '" . ($assetInfo['CPU_Model'] ?? '-') . "', CPU Serial: '" . ($assetInfo['CPU_Serial'] ?? '-') . "')";
                log_edit_history($db, $station, 'Delete', $details);
            }

            echo json_encode(['success' => true]);
            break;

        // --------------------------------------------------------
        // ACTION: FACTORY RESET ASSETS DATABASE
        // --------------------------------------------------------
        case 'reset':
            if (!isset($_SESSION['aether_session_token'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized session access.']);
                exit;
            }

            // Wipe assets table
            $db->exec("DELETE FROM assets");

            // Seed array
            // Seed array (includes local test IP / localhost address for demo purposes)
            $defaults = [
                [101, 'ProDesk 600 G3', '3CQ7482Z7X', 'HP', 'EliteDisplay E232', '6CM7451FL8', 'HP', 'EliteDisplay E232', '6CM7451FL9', 'HP', 'EliteDisplay E232', '6CM7451FL0', 'HP', 'Macys', '3rd', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', '2026-06-02 18:58:00'],
                [102, 'EliteDesk 800 G4', '3CQ8120W2Y', 'HP', 'EliteDisplay E233', '6CM8190Y2B', 'HP', 'EliteDisplay E233', '6CM8190Y2C', 'HP', NULL, NULL, NULL, 'Macys', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', '2026-06-02 18:58:00'],
                [103, 'OptiPlex 7050', 'CN07F10V3S', 'Dell', 'Dell P2417H', 'CN03V10W2R', 'Dell', 'Dell P2417H', 'CN03V10W2S', 'Dell', 'Dell P2417H', 'CN03V10W2T', 'Dell', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [104, 'ThinkCentre M720q', 'PC09X12Y', 'Lenovo', 'ThinkVision T23d', 'V10Y7812', 'Lenovo', 'ThinkVision T23d', 'V10Y7813', 'Lenovo', NULL, NULL, NULL, 'Oscar', '2nd', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [105, 'ProDesk 600 G3', '3CQ7482Z8Y', 'HP', 'EliteDisplay E232', '6CM7451FM1', 'HP', 'EliteDisplay E232', '6CM7451FM2', 'HP', NULL, NULL, NULL, 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [106, 'EliteDesk 800 G4', '3CQ8120W3Z', 'HP', 'EliteDisplay E233', '6CM8190Y3D', 'HP', 'EliteDisplay E233', '6CM8190Y3E', 'HP', NULL, NULL, NULL, 'UHG', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [107, 'OptiPlex 7050', 'CN07F10V4T', 'Dell', 'Dell P2417H', 'CN03V10W3T', 'Dell', 'Dell P2417H', 'CN03V10W3U', 'Dell', NULL, NULL, NULL, 'Oscar', '2nd', 'UP2', 'Pulled Out', '2026-06-02 18:58:00', '2026-06-02 11:46:00'],
                [108, 'ThinkCentre M720q', 'PC09X13Z', 'Lenovo', 'ThinkVision T23d', 'V10Y7814', 'Lenovo', 'ThinkVision T23d', 'V10Y7815', 'Lenovo', NULL, NULL, NULL, 'Oscar', '2nd', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [109, 'ProDesk 600 G3', '3CQ7482Z9Z', 'HP', 'EliteDisplay E232', '6CM7451FM3', 'HP', 'EliteDisplay E232', '6CM7451FM4', 'HP', NULL, NULL, NULL, 'Highmark', 'Ground Floor', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', '2026-06-02 16:01:00'],
                [110, 'EliteDesk 800 G4', '3CQ8120W4A', 'HP', 'EliteDisplay E233', '6CM8190Y4F', 'HP', 'EliteDisplay E233', '6CM8190Y4G', 'HP', NULL, NULL, NULL, 'Highmark', 'Ground Floor', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL]
            ];

            $insSql = "INSERT INTO assets (
                            Station_Number, CPU_Model, CPU_Serial, CPU_Brand,
                            Monitor1_Model, Monitor1_Serial, Monitor1_Brand,
                            Monitor2_Model, Monitor2_Serial, Monitor2_Brand,
                            Monitor3_Model, Monitor3_Serial, Monitor3_Brand,
                            Program, Asset_located_floor, Site, Current_Status, Created_Date, Modified_Date
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $db->prepare($insSql);
            foreach ($defaults as $row) {
                $stmt->execute($row);
            }

            // Log history event
            log_edit_history($db, 0, 'Reset', "Database factory reset. Reseeded default assets.");

            echo json_encode(['success' => true]);
            break;

        // --------------------------------------------------------
        // ACTION: FETCH EDIT HISTORY LOGS
        // --------------------------------------------------------
        case 'history':
            if (!isset($_SESSION['aether_session_token'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized session access.']);
                exit;
            }

            $stmt = $db->query("SELECT * FROM edit_history ORDER BY changed_at DESC");
            $rows = $stmt->fetchAll();

            echo json_encode(['success' => true, 'data' => $rows]);
            break;

        // --------------------------------------------------------
        // ACTION: FETCH HARDWARE INVENTORY
        // --------------------------------------------------------
        case 'inventory':
            if (!isset($_SESSION['aether_session_token'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized session access.']);
                exit;
            }

            // Clean up active assets from inventory before fetching
            cleanup_inventory($db);

            $stmt = $db->query("SELECT * FROM inventory ORDER BY removed_at DESC");
            $rows = $stmt->fetchAll();

            echo json_encode(['success' => true, 'data' => $rows]);
            break;

        // --------------------------------------------------------
        // ACTION: DELETE/SCRAP HARDWARE INVENTORY ITEM
        // --------------------------------------------------------
        case 'delete_inventory':
            if (!isset($_SESSION['aether_session_token'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized session access.']);
                exit;
            }

            $id = intval($inputData['id'] ?? 0);
            $stmt = $db->prepare("DELETE FROM inventory WHERE id = :id");
            $stmt->execute(['id' => $id]);

            echo json_encode(['success' => true]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid routing endpoint.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'API System Failure: ' . $e->getMessage()]);
}
?>
