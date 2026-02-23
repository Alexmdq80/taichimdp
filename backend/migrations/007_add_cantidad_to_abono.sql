-- 007_add_cantidad_to_abono.sql
-- Description: Adds a 'cantidad' column to Abono table to track number of units or multipliers.

ALTER TABLE Abono ADD COLUMN cantidad INT DEFAULT 1 NOT NULL;
