-- ============================================
-- VERIFICAR E CORRIGIR TIPOS DE DADOS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Verificar os tipos de dados das colunas
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('professionals', 'appointments')
  AND column_name IN ('code', 'professional_code')
ORDER BY table_name, column_name;

-- 2. Ver os dados atuais
SELECT id, code, name FROM professionals;
SELECT id, professional_code, customer_name FROM appointments LIMIT 5;

-- 3. Se professional_code em appointments for INTEGER e code em professionals for TEXT,
--    precisamos criar uma nova coluna ou ajustar a lógica

-- Opção A: Adicionar coluna code_int aos professionals
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS code_int INTEGER;

-- Atualizar code_int baseado no id (assumindo que queremos usar o id como código numérico)
UPDATE professionals
SET code_int = id;

-- 4. Recriar a view usando code_int
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

-- Habilitar RLS na view
ALTER VIEW professional_patients SET (security_invoker = true);

-- 5. Verificar se agora funciona
SELECT *
FROM professional_patients
WHERE professional_id = 1;
