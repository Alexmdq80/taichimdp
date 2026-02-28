-- 018_lugar_soft_delete_history.sql
-- Description: Adds soft-deletes and modification history for the Lugar table.

-- 1. Add deleted_at column to Lugar
ALTER TABLE Lugar ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- 2. Create HistorialLugar table
CREATE TABLE IF NOT EXISTS HistorialLugar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lugar_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES User(id) ON DELETE SET NULL
);
