-- 027_add_tipo_to_clase.sql
-- Description: Adds 'tipo' column to Clase table to distinguish between session types.

ALTER TABLE Clase ADD COLUMN tipo ENUM('grupal', 'particular', 'compartida') DEFAULT 'grupal' AFTER id;
