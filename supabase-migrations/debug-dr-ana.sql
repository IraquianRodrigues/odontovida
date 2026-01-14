-- ============================================
-- DEBUG: VERIFICAR DADOS DO DR ANA E AGENDAMENTOS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Ver dados do profissional Dr Ana
SELECT id, code, name, email, specialty
FROM professionals
WHERE name ILIKE '%ana%';

-- 2. Ver agendamentos do paciente iraquian
SELECT id, customer_name, customer_phone, professional_code, service_code, start_time
FROM appointments
WHERE customer_name ILIKE '%iraquian%'
ORDER BY start_time DESC;

-- 3. Verificar se o professional_code do agendamento corresponde ao code do profissional
SELECT 
  a.id as appointment_id,
  a.customer_name,
  a.professional_code as appointment_prof_code,
  p.code as professional_code,
  p.id as professional_id,
  p.name as professional_name,
  p.email as professional_email
FROM appointments a
LEFT JOIN professionals p ON CAST(p.code AS INTEGER) = a.professional_code
WHERE a.customer_name ILIKE '%iraquian%';

-- 4. Testar a view professional_patients para o profissional com seu email
SELECT *
FROM professional_patients
WHERE professional_id IN (
  SELECT id FROM professionals WHERE email = 'iraquianrodrigues2025@gmail.com'
);

-- 5. Ver todos os dados da view professional_patients
SELECT *
FROM professional_patients
LIMIT 10;
