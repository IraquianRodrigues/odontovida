-- =====================================================
-- VINCULAR USUÁRIO DENTISTA AO PROFISSIONAL
-- =====================================================
-- Este script vincula um usuário com role "dentista" a um registro na tabela professionals

-- PASSO 1: Ver todos os usuários dentistas
SELECT 
  up.id as user_id,
  up.email,
  up.full_name,
  up.role
FROM user_profiles up
WHERE up.role = 'dentista'
ORDER BY up.email;

-- PASSO 2: Ver todos os profissionais
SELECT 
  p.id as professional_id,
  p.code,
  p.name,
  p.specialty,
  p.user_id,
  CASE 
    WHEN p.user_id IS NOT NULL THEN (SELECT email FROM user_profiles WHERE id = p.user_id)
    ELSE 'Não vinculado'
  END as linked_email
FROM professionals p
ORDER BY p.name;

-- =====================================================
-- OPÇÃO 1: Criar novo profissional vinculado ao usuário
-- =====================================================
-- Use este método se o dentista ainda não tem registro na tabela professionals

-- Substitua os valores abaixo:
-- - 'SEU_USER_ID_AQUI' = ID do usuário da tabela user_profiles (obtido no PASSO 1)
-- - 'DENT001' = Código único do profissional
-- - 'Dr. João Silva' = Nome do profissional
-- - 'Dentista Geral' = Especialidade

/*
INSERT INTO professionals (code, name, specialty, user_id)
VALUES (
  'DENT001',                    -- Código único
  'Dr. João Silva',             -- Nome do profissional
  'Dentista Geral',             -- Especialidade
  'SEU_USER_ID_AQUI'            -- ID do usuário (UUID)
)
RETURNING *;
*/

-- =====================================================
-- OPÇÃO 2: Vincular profissional existente ao usuário
-- =====================================================
-- Use este método se o profissional já existe na tabela professionals

-- Substitua os valores abaixo:
-- - 'SEU_USER_ID_AQUI' = ID do usuário da tabela user_profiles
-- - 'PROFESSIONAL_ID_AQUI' = ID do profissional na tabela professionals

/*
UPDATE professionals
SET user_id = 'SEU_USER_ID_AQUI'
WHERE id = 'PROFESSIONAL_ID_AQUI'
RETURNING *;
*/

-- OU vincular pelo código do profissional:
/*
UPDATE professionals
SET user_id = 'SEU_USER_ID_AQUI'
WHERE code = 'DENT001'  -- Substitua pelo código do profissional
RETURNING *;
*/

-- =====================================================
-- PASSO 3: Verificar se o vínculo foi criado
-- =====================================================
SELECT 
  p.id as professional_id,
  p.code,
  p.name,
  p.specialty,
  p.user_id,
  up.email as user_email,
  up.role as user_role
FROM professionals p
LEFT JOIN user_profiles up ON p.user_id = up.id
WHERE p.user_id IS NOT NULL
ORDER BY p.name;

-- =====================================================
-- EXEMPLO COMPLETO: Criar dentista do zero
-- =====================================================
-- Este exemplo mostra como criar um dentista completo do zero

/*
-- 1. Criar usuário (se ainda não existir - normalmente feito via signup)
-- Isso é feito automaticamente quando o usuário se registra no sistema

-- 2. Atualizar role para dentista
UPDATE user_profiles
SET role = 'dentista'
WHERE email = 'dentista@exemplo.com';

-- 3. Criar registro de profissional vinculado
INSERT INTO professionals (code, name, specialty, user_id)
VALUES (
  'DENT001',
  'Dr. João Silva',
  'Dentista Geral',
  (SELECT id FROM user_profiles WHERE email = 'dentista@exemplo.com')
)
RETURNING *;
*/

-- =====================================================
-- VERIFICAR PACIENTES DO DENTISTA
-- =====================================================
-- Depois de vincular, você pode verificar quais pacientes o dentista verá

-- Substitua 'SEU_USER_ID_AQUI' pelo ID do usuário dentista
/*
WITH dentist_professional AS (
  SELECT id FROM professionals WHERE user_id = 'SEU_USER_ID_AQUI'
),
dentist_patients AS (
  SELECT DISTINCT client_id
  FROM appointments
  WHERE professional_id = (SELECT id FROM dentist_professional)
)
SELECT 
  c.id,
  c.nome,
  COUNT(a.id) as total_appointments
FROM clientes c
INNER JOIN dentist_patients dp ON c.id = dp.client_id
LEFT JOIN appointments a ON a.client_id = c.id 
  AND a.professional_id = (SELECT id FROM dentist_professional)
GROUP BY c.id, c.nome
ORDER BY c.nome;
*/

-- =====================================================
-- DICAS IMPORTANTES
-- =====================================================
-- 1. Cada profissional pode ter apenas um user_id (relação 1:1)
-- 2. O user_id deve corresponder a um usuário com role 'dentista'
-- 3. Sem agendamentos, o dentista não verá pacientes no odontograma
-- 4. Para testar, crie alguns agendamentos para o profissional
