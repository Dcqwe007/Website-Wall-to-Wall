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

            $stmt = $db->prepare("UPDATE assets SET Current_Status = :status, Modified_Date = NOW() WHERE Station_Number = :station");
            $stmt->execute(['status' => $status, 'station' => $station]);

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

            $stmt = $db->prepare("DELETE FROM assets WHERE Station_Number = :station");
            $stmt->execute(['station' => $station]);

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
