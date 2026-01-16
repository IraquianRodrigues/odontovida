-- Execute this as a transaction
BEGIN;

-- Add code_int column to professionals if it doesn't exist
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS code_int INTEGER;

-- Update code_int based on id
UPDATE professionals
SET code_int = id;

-- Recreate the view using code_int
DROP VIEW IF EXISTS professional_patients;

CREATE OR REPLACE VIEW professional_patients AS
SELECT DISTINCT
  p.id as professional_id,
  c.id as client_id,
  c.nome as client_name,
  c.telefone as client_phone,
  MAX(a.start_time) as last_appointment,
  COUNT(a.id) as total_appointments,
  COUNT(mr.id) as total_records
FROM professionals p
INNER JOIN appointments a ON a.professional_code = p.code_int
INNER JOIN clientes c ON c.telefone = a.customer_phone
LEFT JOIN medical_records mr ON mr.client_id = c.id AND mr.professional_id = p.id
GROUP BY p.id, c.id, c.nome, c.telefone;

-- Enable RLS on the view
ALTER VIEW professional_patients SET (security_invoker = true);

COMMIT;
