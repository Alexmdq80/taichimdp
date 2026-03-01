-- 023_add_clases_por_semana_to_tipo_abono.sql
-- Description: Adds a 'clases_por_semana' column to TipoAbono to manage attendance limits.

ALTER TABLE TipoAbono ADD COLUMN clases_por_semana INT DEFAULT 1;
