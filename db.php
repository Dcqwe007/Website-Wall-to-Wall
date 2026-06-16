<?php
// ========================================================
// DATABASE CONFIGURATION FOR XAMPP
// ========================================================

// 1. Host settings (XAMPP default: localhost)
define('DB_HOST', 'localhost');

// 2. MySQL credentials (XAMPP default: root / no password)
define('DB_USER', 'root');
define('DB_PASS', '');

// 3. Database name (Change this to your actual database name in XAMPP phpMyAdmin)
define('DB_NAME', 'walltowall_db');

/**
 * Creates and returns a PDO connection to the MySQL database.
 */
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        // If the database connection fails, return a JSON error to the AJAX front-end
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection error: ' . $e->getMessage() . 
                         '. Please check if your database name is correct in db.php and XAMPP MySQL is started.'
        ]);
        exit;
    }
}
?>
