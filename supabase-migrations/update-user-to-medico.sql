-- ============================================
-- ATUALIZAR USUÁRIO PARA ROLE 'MEDICO'
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Atualizar o usuário específico para role 'medico'
UPDATE user_profiles
SET role = 'medico',
    updated_at = NOW()
WHERE email = 'iraquianrodrigues2025@gmail.com';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Verificar se a atualização foi bem-sucedida:
SELECT id, email, full_name, role, updated_at
FROM user_profiles
WHERE email = 'iraquianrodrigues2025@gmail.com';
