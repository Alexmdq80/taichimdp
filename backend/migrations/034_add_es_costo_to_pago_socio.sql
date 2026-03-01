-- Add es_costo column to PagoSocio to differentiate between practitioners' payments and user's own costs
ALTER TABLE PagoSocio ADD COLUMN es_costo BOOLEAN NOT NULL DEFAULT FALSE AFTER usuario_id;

-- Add index for filtering by cost
CREATE INDEX idx_es_costo ON PagoSocio(es_costo);
