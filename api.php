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

// Read JSON input payloads
$inputData = json_decode(file_get_contents('php://input'), true) ?? [];

// Establish database link
$db = getDBConnection();

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

            $serial = trim($inputData['serial_number'] ?? '');
            
            if (empty($serial)) {
                echo json_encode(['success' => false, 'message' => 'Serial Number is required.']);
                exit;
            }

            // Check if primary key serial number already exists
            $checkStmt = $db->prepare("SELECT COUNT(*) FROM assets WHERE serial_number = :serial");
            $checkStmt->execute(['serial' => $serial]);
            if ($checkStmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'Asset with Serial Number "' . $serial . '" already exists.']);
                exit;
            }

            $sql = "INSERT INTO assets (
                        station_number, serial_number, model_of_asset, brand_of_asset, 
                        type_of_asset, program, asset_located_floor, site, current_status, created_date
                    ) VALUES (
                        :station_number, :serial_number, :model_of_asset, :brand_of_asset, 
                        :type_of_asset, :program, :asset_located_floor, :site, :current_status, NOW()
                    )";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                'station_number'      => intval($inputData['station_number'] ?? 0),
                'serial_number'       => $serial,
                'model_of_asset'      => trim($inputData['model_of_asset'] ?? ''),
                'brand_of_asset'      => trim($inputData['brand_of_asset'] ?? 'Generic'),
                'type_of_asset'       => trim($inputData['type_of_asset'] ?? 'Monitor'),
                'program'             => trim($inputData['program'] ?? NULL),
                'asset_located_floor' => trim($inputData['asset_located_floor'] ?? NULL),
                'site'                => trim($inputData['site'] ?? NULL),
                'current_status'      => trim($inputData['current_status'] ?? 'Deployed')
            ]);

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

            $oldSerial = trim($inputData['old_serial_number'] ?? '');
            $newSerial = trim($inputData['serial_number'] ?? '');

            if (empty($oldSerial) || empty($newSerial)) {
                echo json_encode(['success' => false, 'message' => 'Old and New Serial numbers are required.']);
                exit;
            }

            // Check if renaming primary key to another existing serial number
            if ($oldSerial !== $newSerial) {
                $checkStmt = $db->prepare("SELECT COUNT(*) FROM assets WHERE serial_number = :serial");
                $checkStmt->execute(['serial' => $newSerial]);
                if ($checkStmt->fetchColumn() > 0) {
                    echo json_encode(['success' => false, 'message' => 'A different asset with Serial Number "' . $newSerial . '" already exists.']);
                    exit;
                }
            }

            $sql = "UPDATE assets SET 
                        station_number = :station_number,
                        serial_number = :new_serial_number,
                        model_of_asset = :model_of_asset,
                        brand_of_asset = :brand_of_asset,
                        type_of_asset = :type_of_asset,
                        program = :program,
                        asset_located_floor = :asset_located_floor,
                        site = :site,
                        current_status = :current_status,
                        modified_date = NOW()
                    WHERE serial_number = :old_serial_number";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                'station_number'      => intval($inputData['station_number'] ?? 0),
                'new_serial_number'   => $newSerial,
                'model_of_asset'      => trim($inputData['model_of_asset'] ?? ''),
                'brand_of_asset'      => trim($inputData['brand_of_asset'] ?? ''),
                'type_of_asset'       => trim($inputData['type_of_asset'] ?? ''),
                'program'             => trim($inputData['program'] ?? NULL),
                'asset_located_floor' => trim($inputData['asset_located_floor'] ?? NULL),
                'site'                => trim($inputData['site'] ?? NULL),
                'current_status'      => trim($inputData['current_status'] ?? 'Deployed'),
                'old_serial_number'   => $oldSerial
            ]);

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

            $serial = trim($inputData['serial_number'] ?? '');
            $status = trim($inputData['current_status'] ?? 'Deployed');

            if (empty($serial)) {
                echo json_encode(['success' => false, 'message' => 'Serial Number is required.']);
                exit;
            }

            $stmt = $db->prepare("UPDATE assets SET current_status = :status, modified_date = NOW() WHERE serial_number = :serial");
            $stmt->execute(['status' => $status, 'serial' => $serial]);

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

            $serial = trim($inputData['serial_number'] ?? '');

            if (empty($serial)) {
                echo json_encode(['success' => false, 'message' => 'Serial Number is required.']);
                exit;
            }

            $stmt = $db->prepare("DELETE FROM assets WHERE serial_number = :serial");
            $stmt->execute(['serial' => $serial]);

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
            $defaults = [
                [0, '0lu4htkq100216b', 'SAMSUNG S22E390H', 'Samsung', 'Monitor', 'Macys', '3rd', 'UP2', 'Deployed', '2026-06-02 18:58:00', '2026-06-02 18:58:00'],
                [1, '3cq40312cr', 'HP P201', 'HP', 'Monitor', 'Macys', '4th', 'UP2', 'Deployed', '2026-06-02 18:58:00', '2026-06-02 18:58:00'],
                [0, '3cq40312dv', 'HP P201', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '3cq4210v7v', 'HP P201', 'HP', 'Monitor', 'Oscar', '2nd', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '3cq4210v8g', 'HP P201', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '3cq4210wh4', 'HP P201', 'HP', 'Monitor', 'UHG', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '3cq4210whj', 'HP PRODISPLAY P201', 'HP', 'Monitor', 'Oscar', '2nd', 'UP2', 'Pulled Out', '2026-06-02 18:58:00', '2026-06-02 11:46:00'],
                [0, '3cq4210whl', 'HP PRODISPLAY P201', 'HP', 'Monitor', 'Oscar', '2nd', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '3cq4210wj1', 'HP P201', 'HP', 'Monitor', 'Highmark', 'Ground Floor', 'UP2', 'Deployed', '2026-06-02 18:58:00', '2026-06-02 16:01:00'],
                [0, '3cq4210wr4', 'HP P201', 'HP', 'Monitor', 'Highmark', 'Ground Floor', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '3cq4210ws7', 'HP P201', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '6cm3413s1b', 'HP P201', 'HP', 'Monitor', 'UHG', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '6cm3413sz2', 'HP P201', 'HP', 'Monitor', 'UHG', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '6cm3502bxx', 'HP P201', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '6cm3502cr3', 'HP P201', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '6cm4060ldp', 'HP P201', 'HP', 'Monitor', 'UHG', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '6cm4160rv0', 'HP PRODISPLAY P201', 'HP', 'Monitor', 'Oscar', '2nd', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '6cm4160un9', 'HP P201', 'HP', 'Monitor', 'Highmark', 'Ground Floor', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '6cm4172zt5', 'HP P201', 'HP', 'Monitor', 'UHG', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '6cm5161123', 'HP P202', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '6cm52619gc', 'HP P221', 'HP', 'Monitor', 'Xerox', '3rd', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL],
                [0, '6cm5260jnm', 'HP P201', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL]
            ];

            $insSql = "INSERT INTO assets (
                            station_number, serial_number, model_of_asset, brand_of_asset, 
                            type_of_asset, program, asset_located_floor, site, current_status, created_date, modified_date
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $db->prepare($insSql);
            foreach ($defaults as $row) {
                $stmt->execute($row);
            }

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
