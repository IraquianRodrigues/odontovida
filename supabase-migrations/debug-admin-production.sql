-- =====================================================
-- DEBUG: Verificar configuração de admin em produção
-- =====================================================
-- Execute este script no Supabase SQL Editor de PRODUÇÃO
-- =====================================================

-- 1. Verificar se o usuário existe e qual é o role
SELECT 
  'User Profile Check' as check_name,
  id,
  email,
  role,
  full_name,
  created_at,
  updated_at
FROM user_profiles
WHERE email = 'SEU_EMAIL_AQUI'; -- SUBSTITUA pelo seu email

-- 2. Verificar se as policies de odontogram foram criadas
SELECT 
  'Odontogram Policies' as check_name,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('odontograms', 'tooth_records', 'tooth_surface_conditions', 'tooth_treatment_history')
ORDER BY tablename, policyname;

-- 3. Verificar se a tabela user_profiles tem a constraint correta
SELECT 
  'User Profiles Constraints' as check_name,
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_profiles'::regclass;

-- 4. Testar se o usuário atual tem role admin
SELECT 
  'Current User Role' as check_name,
  auth.uid() as user_id,
  up.email,
  up.role,
  up.full_name
FROM user_profiles up
WHERE up.id = auth.uid();

-- =====================================================
-- AÇÕES CORRETIVAS (execute se necessário)
-- =====================================================

-- Se o role não for 'admin', execute:
-- UPDATE user_profiles
-- SET role = 'admin'
-- WHERE email = 'SEU_EMAIL_AQUI';

-- Se as policies não existirem, execute o arquivo:
-- add-admin-odontogram-access.sql

-- =====================================================
