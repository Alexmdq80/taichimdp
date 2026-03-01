-- 026_allow_null_duration_in_tipo_abono.sql
-- Description: Makes duracion_dias nullable to support flexible agenda classes.

ALTER TABLE TipoAbono MODIFY COLUMN duracion_dias INT NULL;
