-- Migration: Allow abono_id to be NULL in Pago table
-- This allows for payments that are not directly linked to an abono purchase,
-- such as standalone social fee payments.

ALTER TABLE Pago MODIFY abono_id INT NULL;
