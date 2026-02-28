-- 017_actividad_soft_delete_history.sql
-- Description: Adds soft-deletes and modification history for the Actividad table.

-- 1. Add deleted_at column to Actividad
ALTER TABLE Actividad ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- 2. Create HistorialActividad table
CREATE TABLE IF NOT EXISTS HistorialActividad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actividad_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES User(id) ON DELETE SET NULL
);
