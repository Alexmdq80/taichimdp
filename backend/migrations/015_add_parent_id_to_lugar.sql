-- 015_add_parent_id_to_lugar.sql
-- Description: Adds a parent_id to Lugar to allow sub-locations (rooms).

ALTER TABLE Lugar
ADD COLUMN parent_id INT NULL,
ADD CONSTRAINT fk_lugar_parent FOREIGN KEY (parent_id) REFERENCES Lugar(id) ON DELETE SET NULL;
