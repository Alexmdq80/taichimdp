-- Add pagado_directo and estado_desconocido to PagoSocio table
ALTER TABLE PagoSocio 
ADD COLUMN pagado_directo BOOLEAN DEFAULT FALSE,
ADD COLUMN estado_desconocido BOOLEAN DEFAULT FALSE;
