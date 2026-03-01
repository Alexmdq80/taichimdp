-- Link Practicante with User and add teacher flag
ALTER TABLE Practicante ADD COLUMN user_id INT NULL AFTER id;
ALTER TABLE Practicante ADD COLUMN es_profesor BOOLEAN DEFAULT FALSE AFTER user_id;

-- Add foreign key constraint
ALTER TABLE Practicante ADD CONSTRAINT fk_practicante_user FOREIGN KEY (user_id) REFERENCES User(id);

-- Index for teacher filtering
CREATE INDEX idx_es_profesor ON Practicante(es_profesor);
