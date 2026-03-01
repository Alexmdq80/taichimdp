-- 024_update_tipo_abono_categories.sql
-- Description: Updates categories to distinguish between Group and Private classes.

-- Update ENUM values
ALTER TABLE TipoAbono MODIFY COLUMN categoria ENUM('grupal', 'particular', 'otro') DEFAULT 'grupal' NOT NULL;

-- Update existing data
UPDATE TipoAbono SET categoria = 'grupal' WHERE categoria = 'clase' OR categoria IS NULL;
UPDATE TipoAbono SET categoria = 'grupal' WHERE categoria = 'cuota_club'; -- Safe fallback
