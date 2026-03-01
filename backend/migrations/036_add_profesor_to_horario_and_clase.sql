-- Add profesor_id to Horario and Clase
ALTER TABLE Horario ADD COLUMN profesor_id INT NULL AFTER lugar_id;
ALTER TABLE Clase ADD COLUMN profesor_id INT NULL AFTER lugar_id;

-- Add foreign key constraints (linking to Practicante.id)
ALTER TABLE Horario ADD CONSTRAINT fk_horario_profesor FOREIGN KEY (profesor_id) REFERENCES Practicante(id);
ALTER TABLE Clase ADD CONSTRAINT fk_clase_profesor FOREIGN KEY (profesor_id) REFERENCES Practicante(id);

-- Indexes for performance
CREATE INDEX idx_horario_profesor ON Horario(profesor_id);
CREATE INDEX idx_clase_profesor ON Clase(profesor_id);
