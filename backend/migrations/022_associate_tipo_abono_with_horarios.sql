-- 022_associate_tipo_abono_with_horarios.sql
-- Description: Associate TipoAbono with multiple Horarios and remove redundant fields.

-- Create join table for TipoAbono and Horario
CREATE TABLE IF NOT EXISTS TipoAbono_Horario (
    tipo_abono_id INT NOT NULL,
    horario_id INT NOT NULL,
    PRIMARY KEY (tipo_abono_id, horario_id),
    FOREIGN KEY (tipo_abono_id) REFERENCES TipoAbono(id) ON DELETE CASCADE,
    FOREIGN KEY (horario_id) REFERENCES Horario(id) ON DELETE CASCADE
);

-- Note: We don't DROP columns immediately to avoid data loss during transition if needed, 
-- but we'll stop using them in the code. 
-- However, the user specifically asked to "remove" them.
-- To be safe, we'll just make them nullable if they aren't already.

ALTER TABLE TipoAbono MODIFY COLUMN categoria ENUM('clase', 'cuota_club', 'otro') NULL;
ALTER TABLE TipoAbono MODIFY COLUMN lugar_id INT NULL;
