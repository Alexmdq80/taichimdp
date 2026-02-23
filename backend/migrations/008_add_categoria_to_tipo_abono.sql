-- 008_add_categoria_to_tipo_abono.sql
-- Description: Adds a 'categoria' column to TipoAbono to distinguish between internal and external payments.

ALTER TABLE TipoAbono ADD COLUMN categoria ENUM('clase', 'cuota_club', 'otro') DEFAULT 'clase' NOT NULL;
