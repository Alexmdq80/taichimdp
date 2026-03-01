-- Add professor payment tracking to Clase
ALTER TABLE Clase ADD COLUMN pago_profesor_realizado BOOLEAN DEFAULT FALSE AFTER usuario_id;
ALTER TABLE Clase ADD COLUMN fecha_pago_profesor DATE NULL AFTER pago_profesor_realizado;

-- Index for payment filtering
CREATE INDEX idx_pago_profesor ON Clase(pago_profesor_realizado);
