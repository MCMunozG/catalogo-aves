CREATE DATABASE IF NOT EXISTS catalogo_aves_accounts CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS catalogo_aves_catalog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS catalogo_aves_observation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS catalogo_aves_community CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON catalogo_aves_accounts.* TO 'catalogo_aves'@'%';
GRANT ALL PRIVILEGES ON catalogo_aves_catalog.* TO 'catalogo_aves'@'%';
GRANT ALL PRIVILEGES ON catalogo_aves_observation.* TO 'catalogo_aves'@'%';
GRANT ALL PRIVILEGES ON catalogo_aves_community.* TO 'catalogo_aves'@'%';
FLUSH PRIVILEGES;
