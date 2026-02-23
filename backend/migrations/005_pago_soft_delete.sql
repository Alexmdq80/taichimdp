-- 005_pago_soft_delete.sql
-- Description: Adds soft-delete to the Pago table and updates Abono status.

-- 1. Add deleted_at column to Pago
ALTER TABLE Pago ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- 2. Update Abono estado enum to include 'cancelado'
ALTER TABLE Abono MODIFY COLUMN estado ENUM('activo', 'vencido', 'proximo_vencer', 'cancelado') NULL DEFAULT 'activo';
