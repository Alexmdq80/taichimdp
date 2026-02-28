-- 1. Table: Horario (Oferta de Clases Semanales)
CREATE TABLE IF NOT EXISTS Horario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actividad_id INT NOT NULL,
    lugar_id INT NOT NULL,
    dia_semana TINYINT NOT NULL COMMENT '0=Domingo, 1=Lunes, ..., 6=Sábado',
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (actividad_id) REFERENCES Actividad(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (lugar_id) REFERENCES Lugar(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_actividad (actividad_id),
    INDEX idx_lugar (lugar_id),
    INDEX idx_dia_hora (dia_semana, hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. HistorialHorario (for Audit)
CREATE TABLE IF NOT EXISTS HistorialHorario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    horario_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON NULL,
    datos_nuevos JSON NULL,
    usuario_id INT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES User(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_horario (horario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Update Clase Table
-- First, empty it if it has data that doesn't follow new constraints (assuming it's empty as it's not used)
ALTER TABLE Clase ADD COLUMN horario_id INT NULL DEFAULT NULL AFTER id;
ALTER TABLE Clase ADD COLUMN actividad_id INT NOT NULL AFTER horario_id;
ALTER TABLE Clase ADD COLUMN lugar_id INT NOT NULL AFTER actividad_id;
ALTER TABLE Clase ADD COLUMN hora_fin TIME NOT NULL AFTER hora;
ALTER TABLE Clase ADD COLUMN usuario_id INT NULL AFTER descripcion;

-- Add constraints for Clase
ALTER TABLE Clase ADD CONSTRAINT fk_clase_horario FOREIGN KEY (horario_id) REFERENCES Horario(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE Clase ADD CONSTRAINT fk_clase_actividad FOREIGN KEY (actividad_id) REFERENCES Actividad(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE Clase ADD CONSTRAINT fk_clase_lugar FOREIGN KEY (lugar_id) REFERENCES Lugar(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE Clase ADD CONSTRAINT fk_clase_usuario FOREIGN KEY (usuario_id) REFERENCES User(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX idx_actividad ON Clase(actividad_id);
CREATE INDEX idx_lugar ON Clase(lugar_id);
CREATE INDEX idx_horario ON Clase(horario_id);
