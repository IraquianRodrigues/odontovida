-- =====================================================
-- DEBUG SCRIPT - Verificar Permissões do Odontograma
-- =====================================================
-- Execute este script no Supabase SQL Editor para diagnosticar o problema

-- 1. Verificar usuários e suas roles
SELECT 
  id,
  email,
  role,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 2. Verificar se há odontogramas criados
SELECT 
  id,
  patient_id,
  created_by,
  created_at
FROM odontograms
ORDER BY created_at DESC
LIMIT 10;

-- 3. Testar se o usuário atual pode ver user_profiles
SELECT 
  auth.uid() as current_user_id,
  (SELECT role FROM user_profiles WHERE id = auth.uid()) as current_user_role;

-- 4. Verificar se as policies estão ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('odontograms', 'tooth_records', 'tooth_surface_conditions', 'tooth_treatment_history')
ORDER BY tablename, policyname;

-- 5. Verificar RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('odontograms', 'tooth_records', 'tooth_surface_conditions', 'tooth_treatment_history');

-- =====================================================
-- SE O USUÁRIO NÃO FOR DENTISTA, EXECUTE ISSO:
-- =====================================================
-- Substitua 'seu-email@exemplo.com' pelo email do usuário que você está usando

-- UPDATE user_profiles 
-- SET role = 'dentista' 
-- WHERE email = 'seu-email@exemplo.com';

-- =====================================================
-- TESTE MANUAL DE INSERÇÃO (como dentista)
-- =====================================================
-- Depois de garantir que você é dentista, teste criar um odontograma manualmente:

-- INSERT INTO odontograms (patient_id)
-- VALUES (1); -- Substitua 1 pelo ID de um paciente real

-- Se der erro, copie e cole o erro completo aqui
