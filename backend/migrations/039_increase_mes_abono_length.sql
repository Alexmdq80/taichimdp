-- Migration: Increase length of mes_abono column in Pago and Abono tables
-- This allows for descriptive month names like "Septiembre 2026" instead of just "YYYY-MM".

ALTER TABLE Pago MODIFY mes_abono VARCHAR(50) DEFAULT NULL;
ALTER TABLE Abono MODIFY mes_abono VARCHAR(50) DEFAULT NULL;
