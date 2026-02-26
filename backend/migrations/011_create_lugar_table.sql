-- 011_create_lugar_table.sql
-- Description: Creates Lugar table and migrates TipoAbono and Abono to use foreign keys.

-- 1. Create Lugar table
CREATE TABLE IF NOT EXISTS Lugar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Modify TipoAbono
ALTER TABLE TipoAbono RENAME COLUMN lugar TO lugar_old;
ALTER TABLE TipoAbono ADD COLUMN lugar_id INT NULL;
ALTER TABLE TipoAbono ADD FOREIGN KEY (lugar_id) REFERENCES Lugar(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Modify Abono
ALTER TABLE Abono RENAME COLUMN lugar TO lugar_old;
ALTER TABLE Abono ADD COLUMN lugar_id INT NULL;
ALTER TABLE Abono ADD FOREIGN KEY (lugar_id) REFERENCES Lugar(id) ON DELETE SET NULL ON UPDATE CASCADE;
