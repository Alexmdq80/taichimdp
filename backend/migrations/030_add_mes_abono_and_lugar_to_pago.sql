-- 030_add_mes_abono_and_lugar_to_pago.sql
-- Description: Adds mes_abono and lugar_id to Pago table for better traceability.

ALTER TABLE Pago ADD COLUMN mes_abono VARCHAR(7) DEFAULT NULL AFTER abono_id;
ALTER TABLE Pago ADD COLUMN lugar_id INT DEFAULT NULL AFTER mes_abono;

-- Add foreign key for lugar_id
ALTER TABLE Pago ADD CONSTRAINT fk_pago_lugar FOREIGN KEY (lugar_id) REFERENCES Lugar(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Optional: Populate existing data from linked Abonos
UPDATE Pago p 
JOIN Abono a ON p.abono_id = a.id 
SET p.mes_abono = a.mes_abono, p.lugar_id = a.lugar_id;
