-- 006_allow_zero_duration_abono.sql
-- Description: Allows TipoAbono to have 0 days (for per-unit classes) and updates Abono constraints.

-- 1. Update TipoAbono constraints
-- We use the exact names found in information_schema
ALTER TABLE TipoAbono DROP CHECK tipoabono_chk_1;
-- Recreate it allowing >= 0
ALTER TABLE TipoAbono ADD CONSTRAINT tipoabono_duracion_min CHECK (duracion_dias >= 0);

-- 2. Update Abono check constraint to allow same-day expiration
ALTER TABLE Abono DROP CHECK abono_chk_1;
ALTER TABLE Abono ADD CONSTRAINT abono_fecha_vencimiento_valida CHECK (fecha_vencimiento >= fecha_inicio);
