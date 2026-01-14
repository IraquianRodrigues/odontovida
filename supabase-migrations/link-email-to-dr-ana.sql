-- ============================================
-- ADICIONAR COLUNA EMAIL À TABELA PROFESSIONALS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Adicionar coluna email à tabela professionals
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_professionals_email ON professionals(email);

-- 3. Atualizar o email do profissional Dr Ana para o seu email
UPDATE professionals
SET email = 'iraquianrodrigues2025@gmail.com'
WHERE name ILIKE '%ana%'
RETURNING id, code, name, email;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Verificar se a atualização foi bem-sucedida:
SELECT id, code, name, email, specialty
FROM professionals
WHERE email = 'iraquianrodrigues2025@gmail.com';

-- Ver todos os profissionais:
SELECT id, code, name, email, specialty
FROM professionals
ORDER BY id;
