-- 042_add_pago_socio_id_to_pago.sql
-- Description: Adds a reference from Pago (cash register) to PagoSocio (socio file).
-- This allows cascading deletions when a social fee receipt is removed.

ALTER TABLE Pago ADD COLUMN pago_socio_id INT NULL AFTER abono_id;
ALTER TABLE Pago ADD CONSTRAINT fk_pago_pago_socio FOREIGN KEY (pago_socio_id) REFERENCES PagoSocio(id);
