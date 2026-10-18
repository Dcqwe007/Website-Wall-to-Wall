-- ========================================================
-- DATABASE SCHEMA SETUP FOR XAMPP (walltowall_db)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `walltowall_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `walltowall_db`;

-- 1. Create the Users Table (Exactly matching user schema screenshot)
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT 'Active',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Create the Assets Table (matching the API and dashboard field names)
CREATE TABLE IF NOT EXISTS `assets` (
  `Station_Number` int(11) NOT NULL,
  `CPU_Model` varchar(100) NOT NULL DEFAULT '',
  `CPU_Serial` varchar(50) NOT NULL DEFAULT '',
  `CPU_Brand` varchar(100) NOT NULL DEFAULT '',
  `Monitor1_Model` varchar(100) NOT NULL DEFAULT '',
  `Monitor1_Serial` varchar(50) NOT NULL DEFAULT '',
  `Monitor1_Brand` varchar(100) NOT NULL DEFAULT '',
  `Monitor2_Model` varchar(100) NOT NULL DEFAULT '',
  `Monitor2_Serial` varchar(50) NOT NULL DEFAULT '',
  `Monitor2_Brand` varchar(100) NOT NULL DEFAULT '',
  `Monitor3_Model` varchar(100) NOT NULL DEFAULT '',
  `Monitor3_Serial` varchar(50) NOT NULL DEFAULT '',
  `Monitor3_Brand` varchar(100) NOT NULL DEFAULT '',
  `Program` varchar(100) DEFAULT NULL,
  `Asset_located_floor` varchar(20) DEFAULT NULL,
  `Site` varchar(17) DEFAULT NULL,
  `Current_Status` varchar(50) NOT NULL DEFAULT 'Onsite Deployed',
  `Created_Date` datetime DEFAULT NULL,
  `Modified_Date` datetime DEFAULT NULL,
  PRIMARY KEY (`Station_Number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================================
-- INITIAL SEED RECORDS DATA
-- ========================================================

-- Insert default admin user credentials (matches plain text and hash fallback check)
INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `status`) 
VALUES (1, 'admin', 'admin123', 'admin@aether.com', 'Active')
ON DUPLICATE KEY UPDATE `username`='admin';

-- Insert a default asset record.
INSERT INTO `assets` (
  `Station_Number`, `CPU_Model`, `CPU_Serial`, `CPU_Brand`,
  `Monitor1_Model`, `Monitor1_Serial`, `Monitor1_Brand`,
  `Program`, `Asset_located_floor`, `Site`, `Current_Status`,
  `Created_Date`, `Modified_Date`
) VALUES (
  1, 'HP ProDesk', 'CPU-0001', 'HP',
  'HP P201', 'MON-0001', 'HP',
  'Macys', '4th', 'UP2', 'Onsite Deployed',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE `Station_Number`=`Station_Number`;

-- 3. Create the Edit History Table to log all changes in the system
CREATE TABLE IF NOT EXISTS `edit_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_number` int(11) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `details` text NOT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Create the Replaced Components Inventory Table
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `asset_type` VARCHAR(50) NOT NULL,
  `model` VARCHAR(100) DEFAULT NULL,
  `serial_number` VARCHAR(50) NOT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `previous_station` INT NOT NULL,
  `username` VARCHAR(50) NOT NULL DEFAULT 'System',
  `removed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(50) DEFAULT 'On Inventory'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. Create the Storage Table
CREATE TABLE IF NOT EXISTS `storage` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `asset_type` VARCHAR(50) NOT NULL,
  `model` VARCHAR(100) DEFAULT NULL,
  `serial_number` VARCHAR(50) NOT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `location` VARCHAR(100) DEFAULT 'Main Storage Room',
  `quantity` INT DEFAULT 1,
  `username` VARCHAR(50) NOT NULL DEFAULT 'System',
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(50) DEFAULT 'In Storage'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
