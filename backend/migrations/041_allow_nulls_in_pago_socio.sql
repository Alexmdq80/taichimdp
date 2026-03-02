-- 041_allow_nulls_in_pago_socio.sql
-- Description: Allows NULL values for fecha_pago, fecha_vencimiento and mes_abono if needed.
-- Also removes strict NOT NULL constraint to allow registrations with only month and amount.

ALTER TABLE PagoSocio MODIFY fecha_pago DATE NULL;
ALTER TABLE PagoSocio MODIFY fecha_vencimiento DATE NULL;
ALTER TABLE PagoSocio MODIFY mes_abono VARCHAR(50) NULL;
