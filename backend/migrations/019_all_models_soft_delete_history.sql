-- 019_all_models_soft_delete_history.sql
-- Description: Adds soft-deletes and modification history for remaining models.

-- 1. Practicante
ALTER TABLE Practicante ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
CREATE TABLE IF NOT EXISTS HistorialPracticante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    practicante_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES User(id) ON DELETE SET NULL
);

-- 2. Abono
ALTER TABLE Abono ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
CREATE TABLE IF NOT EXISTS HistorialAbono (
    id INT AUTO_INCREMENT PRIMARY KEY,
    abono_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES User(id) ON DELETE SET NULL
);

-- 3. Pago (Already has deleted_at from migration 005)
CREATE TABLE IF NOT EXISTS HistorialPago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pago_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES User(id) ON DELETE SET NULL
);

-- 4. Clase
ALTER TABLE Clase ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
CREATE TABLE IF NOT EXISTS HistorialClase (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clase_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES User(id) ON DELETE SET NULL
);

-- 5. Asistencia
ALTER TABLE Asistencia ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
CREATE TABLE IF NOT EXISTS HistorialAsistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asistencia_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES User(id) ON DELETE SET NULL
);

-- 6. User (Usuarios del sistema)
ALTER TABLE User ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
CREATE TABLE IF NOT EXISTS HistorialUser (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES User(id) ON DELETE SET NULL
);

-- 7. HistorialSalud (Although it's history itself, auditing changes to it is good practice)
ALTER TABLE HistorialSalud ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
CREATE TABLE IF NOT EXISTS AuditHistorialSalud (
    id INT AUTO_INCREMENT PRIMARY KEY,
    historial_salud_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES User(id) ON DELETE SET NULL
);
