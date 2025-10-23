-- Script de configuración de la base de datos Eb_SimWeb
-- Ejecutar este script en el servidor de producción

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `Eb_SimWeb` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE `Eb_SimWeb`;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `last_login` TIMESTAMP NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `role` ENUM('user', 'admin') DEFAULT 'user',
    INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de sesiones
CREATE TABLE IF NOT EXISTS `sessions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `token` VARCHAR(512) NOT NULL,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `expires_at` DATETIME NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_activity` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_token` (`token`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla para restablecimiento de contraseñas
CREATE TABLE IF NOT EXISTS `password_resets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `token` VARCHAR(100) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `used` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_token` (`token`),
    INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear un usuario administrador inicial (cambiar la contraseña después)
-- La contraseña es 'Admin123!'
INSERT INTO `users` (`email`, `password`, `first_name`, `last_name`, `role`, `is_active`) 
VALUES (
    'ebracingevents@gmail.com', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'Administrador', 
    'Sistema', 
    'admin',
    TRUE
) 
ON DUPLICATE KEY UPDATE 
    `first_name` = VALUES(`first_name`), 
    `last_name` = VALUES(`last_name`),
    `role` = VALUES(`role`),
    `is_active` = VALUES(`is_active`);

-- Crear índices adicionales para mejorar el rendimiento
CREATE INDEX `idx_user_email` ON `users` (`email`);
CREATE INDEX `idx_user_active` ON `users` (`is_active`);
CREATE INDEX `idx_session_user` ON `sessions` (`user_id`, `expires_at`);

-- Crear usuario con permisos limitados (opcional, para la aplicación)
-- Nota: Ajusta la contraseña y los permisos según sea necesario
-- CREATE USER IF NOT EXISTS 'app_ebsimweb'@'%' IDENTIFIED BY 'una_contraseña_segura';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON `Eb_SimWeb`.* TO 'app_ebsimweb'@'%';
-- FLUSH PRIVILEGES;

-- Mostrar mensaje de éxito
SELECT 'Base de datos Eb_SimWeb configurada correctamente' AS message;
