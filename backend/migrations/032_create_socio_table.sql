-- Create Socio table
CREATE TABLE IF NOT EXISTS Socio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    practicante_id INT NOT NULL,
    lugar_id INT NOT NULL,
    numero_socio VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (practicante_id) REFERENCES Practicante(id),
    FOREIGN KEY (lugar_id) REFERENCES Lugar(id),
    UNIQUE KEY idx_practicante_lugar (practicante_id, lugar_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create HistorialSocio table
CREATE TABLE IF NOT EXISTS HistorialSocio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    socio_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores TEXT,
    datos_nuevos TEXT,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (socio_id) REFERENCES Socio(id),
    FOREIGN KEY (usuario_id) REFERENCES User(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
