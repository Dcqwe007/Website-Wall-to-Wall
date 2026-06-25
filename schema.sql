-- ========================================================
-- DATABASE SCHEMA SETUP FOR XAMPP (it_monitoring)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `it_monitoring` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `it_monitoring`;

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

-- 2. Create the Assets Table (Exactly matching asset schema screenshot)
CREATE TABLE IF NOT EXISTS `assets` (
  `station_number` int(11) NOT NULL,
  `serial_number` varchar(50) NOT NULL,
  `model_of_asset` varchar(100) NOT NULL,
  `brand_of_asset` varchar(100) NOT NULL,
  `type_of_asset` varchar(10) NOT NULL,
  `program` varchar(100) DEFAULT NULL,
  `asset_located_floor` varchar(20) DEFAULT NULL,
  `site` varchar(17) DEFAULT NULL,
  `current_status` varchar(50) NOT NULL,
  `created_date` datetime DEFAULT NULL,
  `modified_date` datetime DEFAULT NULL,
  PRIMARY KEY (`serial_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================================
-- INITIAL SEED RECORDS DATA
-- ========================================================

-- Insert default admin user credentials (matches plain text and hash fallback check)
INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `status`) 
VALUES (1, 'admin', 'admin123', 'admin@aether.com', 'Active')
ON DUPLICATE KEY UPDATE `username`='admin';

-- Insert default 22 asset monitoring rows
INSERT INTO `assets` (`station_number`, `serial_number`, `model_of_asset`, `brand_of_asset`, `type_of_asset`, `program`, `asset_located_floor`, `site`, `current_status`, `created_date`, `modified_date`) VALUES
(0, '0lu4htkq100216b', 'SAMSUNG S22E390H', 'Samsung', 'Monitor', 'Macys', '3rd', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', '2026-06-02 18:58:00'),
(1, '3cq40312cr', 'HP P201', 'HP', 'Monitor', 'Macys', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', '2026-06-02 18:58:00'),
(0, '3cq40312dv', 'HP P201', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '3cq4210v7v', 'HP P201', 'HP', 'Monitor', 'Oscar', '2nd', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '3cq4210v8g', 'HP P201', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '3cq4210wh4', 'HP P201', 'HP', 'Monitor', 'UHG', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '3cq4210whj', 'HP PRODISPLAY P201', 'HP', 'Monitor', 'Oscar', '2nd', 'UP2', 'Pulled Out', '2026-06-02 18:58:00', '2026-06-02 11:46:00'),
(0, '3cq4210whl', 'HP PRODISPLAY P201', 'HP', 'Monitor', 'Oscar', '2nd', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '3cq4210wj1', 'HP P201', 'HP', 'Monitor', 'Highmark', 'Ground Floor', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', '2026-06-02 16:01:00'),
(0, '3cq4210wr4', 'HP P201', 'HP', 'Monitor', 'Highmark', 'Ground Floor', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '3cq4210ws7', 'HP P201', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '6cm3413s1b', 'HP P201', 'HP', 'Monitor', 'UHG', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '6cm3413sz2', 'HP P201', 'HP', 'Monitor', 'UHG', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '6cm3502bxx', 'HP P201', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '6cm3502cr3', 'HP P201', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '6cm4060ldp', 'HP P201', 'HP', 'Monitor', 'UHG', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '6cm4160rv0', 'HP PRODISPLAY P201', 'HP', 'Monitor', 'Oscar', '2nd', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '6cm4160un9', 'HP P201', 'HP', 'Monitor', 'Highmark', 'Ground Floor', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '6cm4172zt5', 'HP P201', 'HP', 'Monitor', 'UHG', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '6cm5161123', 'HP P202', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '6cm52619gc', 'HP P221', 'HP', 'Monitor', 'Xerox', '3rd', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL),
(0, '6cm5260jnm', 'HP P201', 'HP', 'Monitor', 'Elevance', '4th', 'UP2', 'Onsite Deployed', '2026-06-02 18:58:00', NULL)
ON DUPLICATE KEY UPDATE `serial_number`=`serial_number`;

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
