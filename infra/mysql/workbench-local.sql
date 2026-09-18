-- Run this once in MySQL Workbench as a local administrator.
CREATE DATABASE IF NOT EXISTS catalogo_aves_accounts CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS catalogo_aves_catalog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS catalogo_aves_observation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS catalogo_aves_community CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'catalogo_aves'@'localhost' IDENTIFIED BY 'catalogo_aves_dev';
GRANT ALL PRIVILEGES ON catalogo_aves_accounts.* TO 'catalogo_aves'@'localhost';
GRANT ALL PRIVILEGES ON catalogo_aves_catalog.* TO 'catalogo_aves'@'localhost';
GRANT ALL PRIVILEGES ON catalogo_aves_observation.* TO 'catalogo_aves'@'localhost';
GRANT ALL PRIVILEGES ON catalogo_aves_community.* TO 'catalogo_aves'@'localhost';
FLUSH PRIVILEGES;
