-- Migration 048: Add emergency contact and additional information to Practicante table

ALTER TABLE Practicante
ADD COLUMN emergencia_nombre VARCHAR(255) NULL,
ADD COLUMN emergencia_telefono VARCHAR(50) NULL,
ADD COLUMN obra_social VARCHAR(255) NULL,
ADD COLUMN obra_social_nro VARCHAR(100) NULL,
ADD COLUMN emergencia_servicio VARCHAR(255) NULL,
ADD COLUMN emergencia_servicio_telefono VARCHAR(50) NULL,
ADD COLUMN ocupacion VARCHAR(255) NULL,
ADD COLUMN estudios VARCHAR(255) NULL,
ADD COLUMN actividad_fisica_actual BOOLEAN DEFAULT FALSE,
ADD COLUMN actividad_fisica_detalle TEXT NULL,
ADD COLUMN actividad_fisica_anios_inactivo INT NULL,
ADD COLUMN actividad_fisica_anterior TEXT NULL,
ADD COLUMN observaciones_adicionales TEXT NULL;
