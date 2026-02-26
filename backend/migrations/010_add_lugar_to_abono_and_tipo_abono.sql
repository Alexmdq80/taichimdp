-- 010_add_lugar_to_abono_and_tipo_abono.sql
-- Description: Adds 'lugar' column to TipoAbono and Abono tables.

ALTER TABLE TipoAbono ADD COLUMN lugar VARCHAR(255) DEFAULT NULL;
ALTER TABLE Abono ADD COLUMN lugar VARCHAR(255) DEFAULT NULL;
