-- 025_add_compartida_category_to_tipo_abono.sql
-- Description: Adds 'compartida' category and 'max_personas' column.

-- 1. Update ENUM (Temporary VARCHAR approach for safety)
ALTER TABLE TipoAbono MODIFY COLUMN categoria VARCHAR(20);

-- 2. Add max_personas column
ALTER TABLE TipoAbono ADD COLUMN max_personas INT DEFAULT 1;

-- 3. Restore ENUM with new value
ALTER TABLE TipoAbono MODIFY COLUMN categoria ENUM('grupal', 'particular', 'compartida', 'otro') DEFAULT 'grupal' NOT NULL;
