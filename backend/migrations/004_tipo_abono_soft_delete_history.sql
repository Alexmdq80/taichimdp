-- 004_tipo_abono_soft_delete_history.sql
-- Description: Adds soft-deletes and modification history for the TipoAbono table.

-- 1. Add deleted_at column to TipoAbono
ALTER TABLE TipoAbono ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- 2. Create HistorialTipoAbono table
CREATE TABLE IF NOT EXISTS HistorialTipoAbono (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_abono_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES User(id) ON DELETE SET NULL
);
