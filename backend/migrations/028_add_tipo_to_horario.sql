-- 028_add_tipo_to_horario.sql
-- Description: Adds 'tipo' column to Horario table.

ALTER TABLE Horario ADD COLUMN tipo ENUM('grupal', 'particular', 'compartida') DEFAULT 'grupal' AFTER id;
