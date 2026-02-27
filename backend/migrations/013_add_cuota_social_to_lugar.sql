-- 013_add_cuota_social_to_lugar.sql
-- Description: Adds social fee configuration fields to the Lugar table.

ALTER TABLE Lugar
ADD COLUMN cobra_cuota_social TINYINT(1) DEFAULT 0,
ADD COLUMN cuota_social_general DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN cuota_social_descuento DECIMAL(10, 2) DEFAULT 0.00;
