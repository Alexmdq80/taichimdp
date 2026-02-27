-- 014_add_tarifa_to_lugar.sql
-- Description: Adds fee cost and fee type to the Lugar table.

ALTER TABLE Lugar
ADD COLUMN costo_tarifa DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN tipo_tarifa ENUM('mensual', 'por_hora') DEFAULT 'por_hora';
