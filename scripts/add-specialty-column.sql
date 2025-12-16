-- Adiciona coluna specialty à tabela professionals
-- Execute este script no SQL Editor do Supabase

ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS specialty TEXT;

-- Adiciona comentário à coluna
COMMENT ON COLUMN professionals.specialty IS 'Especialidade do profissional (ex: Cardiologia, Dermatologia, etc.)';

