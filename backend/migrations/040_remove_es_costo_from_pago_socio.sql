-- 040_remove_es_costo_from_pago_socio.sql
-- Description: Removes the redundant es_costo column from PagoSocio table.
-- Logic: Cost is now determined by checking if the Practicante is a professor.

ALTER TABLE PagoSocio DROP COLUMN es_costo;
