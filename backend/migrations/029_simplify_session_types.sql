-- 029_simplify_session_types.sql
-- Description: Simplifies 'tipo' column in Clase and Horario tables to two categories.

-- 1. Update Horario
ALTER TABLE Horario MODIFY COLUMN tipo VARCHAR(20);
UPDATE Horario SET tipo = 'flexible' WHERE tipo IN ('particular', 'compartida');
ALTER TABLE Horario MODIFY COLUMN tipo ENUM('grupal', 'flexible') DEFAULT 'grupal' NOT NULL;

-- 2. Update Clase
ALTER TABLE Clase MODIFY COLUMN tipo VARCHAR(20);
UPDATE Clase SET tipo = 'flexible' WHERE tipo IN ('particular', 'compartida');
ALTER TABLE Clase MODIFY COLUMN tipo ENUM('grupal', 'flexible') DEFAULT 'grupal' NOT NULL;
