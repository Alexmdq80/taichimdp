-- 043_create_deuda_table.sql
-- Description: Creates the Deuda table to track pending payments (like salon costs for cancelled classes).

CREATE TABLE IF NOT EXISTS Deuda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    practicante_id INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    concepto VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    estado ENUM('pendiente', 'pagada', 'cancelada') DEFAULT 'pendiente',
    clase_id INT NULL, -- Optional link to the class that generated it
    usuario_id INT, -- Who generated the debt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (practicante_id) REFERENCES Practicante(id),
    FOREIGN KEY (clase_id) REFERENCES Clase(id),
    FOREIGN KEY (usuario_id) REFERENCES User(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- History table
CREATE TABLE IF NOT EXISTS HistorialDeuda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deuda_id INT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deuda_id) REFERENCES Deuda(id),
    FOREIGN KEY (usuario_id) REFERENCES User(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
