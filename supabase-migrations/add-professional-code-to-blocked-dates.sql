-- Migration: Adicionar professional_code na tabela blocked_dates
-- Permite associar bloqueios de datas a profissionais específicos
-- Bloqueios com professional_code = NULL continuam sendo globais (clínica)

ALTER TABLE blocked_dates
ADD COLUMN IF NOT EXISTS professional_code INTEGER;

-- Índice para queries por profissional
CREATE INDEX IF NOT EXISTS idx_blocked_dates_professional_code
ON blocked_dates(professional_code);

-- Adicionar suporte a data fim para bloqueios de múltiplos dias (viagens)
ALTER TABLE blocked_dates
ADD COLUMN IF NOT EXISTS end_date DATE;
