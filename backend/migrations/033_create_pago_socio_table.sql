-- Create PagoSocio table
CREATE TABLE IF NOT EXISTS PagoSocio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    socio_id INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    fecha_pago DATE NOT NULL,
    mes_abono VARCHAR(50) NOT NULL, -- Ej: "Marzo 2024"
    fecha_vencimiento DATE NOT NULL,
    observaciones TEXT,
    usuario_id INT, -- El usuario que registró el pago
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (socio_id) REFERENCES Socio(id),
    FOREIGN KEY (usuario_id) REFERENCES User(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create HistorialPagoSocio table
CREATE TABLE IF NOT EXISTS HistorialPagoSocio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pago_socio_id INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores TEXT,
    datos_nuevos TEXT,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pago_socio_id) REFERENCES PagoSocio(id),
    FOREIGN KEY (usuario_id) REFERENCES User(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
