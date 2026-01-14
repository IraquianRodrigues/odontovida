-- ============================================
-- ADICIONAR ROLE 'MEDICO' - Clínica Integrada
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Atualizar constraint da tabela user_profiles para incluir 'medico'
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('admin', 'recepcionista', 'dentista', 'medico'));

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Verificar a constraint:
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
AND conname = 'user_profiles_role_check';

-- Ver todos os roles disponíveis:
SELECT DISTINCT role FROM user_profiles;
