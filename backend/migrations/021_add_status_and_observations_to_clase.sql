-- Actualización de la tabla Clase para manejar estados y observaciones detalladas
ALTER TABLE Clase ADD COLUMN estado ENUM('programada', 'realizada', 'cancelada', 'suspendida') DEFAULT 'programada' AFTER hora_fin;
ALTER TABLE Clase ADD COLUMN motivo_cancelacion TEXT NULL AFTER estado;
ALTER TABLE Clase CHANGE COLUMN descripcion observaciones TEXT NULL;

-- Índices para búsquedas por estado
CREATE INDEX idx_estado ON Clase(estado);
