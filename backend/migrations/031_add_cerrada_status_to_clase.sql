-- Agregar el estado 'cerrada' al enum de la tabla Clase
ALTER TABLE Clase MODIFY COLUMN estado ENUM('programada', 'realizada', 'cancelada', 'suspendida', 'cerrada') DEFAULT 'programada';
