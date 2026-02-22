-- 003_create_tipo_abono_table.sql
-- Description: Creates the TipoAbono table to manage different types of subscriptions/payments.

CREATE TABLE IF NOT EXISTS TipoAbono (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    duracion_dias INT,
    precio DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);