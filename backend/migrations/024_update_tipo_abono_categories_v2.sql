-- 024_update_tipo_abono_categories_v2.sql
-- Description: Updates categories with safer approach.

-- First, make sure the column can hold the new values (as string)
ALTER TABLE TipoAbono MODIFY COLUMN categoria VARCHAR(20);

-- Update data
UPDATE TipoAbono SET categoria = 'grupal' WHERE categoria = 'clase' OR categoria IS NULL;
UPDATE TipoAbono SET categoria = 'otro' WHERE categoria = 'cuota_club';

-- Finally, set the new ENUM
ALTER TABLE TipoAbono MODIFY COLUMN categoria ENUM('grupal', 'particular', 'otro') DEFAULT 'grupal' NOT NULL;
