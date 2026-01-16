-- ============================================
-- ADICIONAR CAMPOS MERCADO PAGO
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

BEGIN;

-- Adicionar campos de pagamento à tabela transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS mercadopago_preference_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_payment_status TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_payment_link TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_mercadopago_preference_id 
ON transactions(mercadopago_preference_id);

CREATE INDEX IF NOT EXISTS idx_transactions_mercadopago_payment_id 
ON transactions(mercadopago_payment_id);

-- Comentários para documentação
COMMENT ON COLUMN transactions.mercadopago_preference_id IS 'ID da preferência de pagamento criada no Mercado Pago';
COMMENT ON COLUMN transactions.mercadopago_payment_id IS 'ID do pagamento confirmado no Mercado Pago';
COMMENT ON COLUMN transactions.mercadopago_payment_status IS 'Status do pagamento no Mercado Pago (approved, pending, rejected, etc)';
COMMENT ON COLUMN transactions.mercadopago_payment_link IS 'Link direto para o checkout do Mercado Pago';

COMMIT;

-- ============================================
-- Verificar se as colunas foram criadas
-- ============================================
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'transactions' 
-- AND column_name LIKE 'mercadopago%';
