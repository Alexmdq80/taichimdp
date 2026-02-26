-- 009_add_mes_abono_to_abono.sql
-- Description: Adds 'mes_abono' column to Abono table to track which month is being paid.

ALTER TABLE Abono ADD COLUMN mes_abono VARCHAR(7) DEFAULT NULL;
-- Format: YYYY-MM
