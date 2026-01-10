-- ============================================
-- MÓDULO FINANCEIRO - OdontoVida CRM
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query > Cole e Execute
-- ============================================

-- 1. Criar ENUM types
CREATE TYPE transaction_type AS ENUM ('receita', 'despesa');
CREATE TYPE transaction_status AS ENUM ('pendente', 'pago', 'cancelado', 'atrasado');
CREATE TYPE payment_method AS ENUM ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto', 'transferencia');
CREATE TYPE payment_plan_status AS ENUM ('ativo', 'concluido', 'cancelado');

-- 2. Tabela de Transações Financeiras
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    type transaction_type NOT NULL DEFAULT 'receita',
    category TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method,
    status transaction_status NOT NULL DEFAULT 'pendente',
    due_date DATE NOT NULL,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabela de Planos de Pagamento (Parcelamentos)
CREATE TABLE IF NOT EXISTS payment_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    installments INTEGER NOT NULL,
    paid_installments INTEGER DEFAULT 0,
    status payment_plan_status NOT NULL DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabela de Parcelas
CREATE TABLE IF NOT EXISTS installments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status transaction_status NOT NULL DEFAULT 'pendente',
    payment_method payment_method,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabela de Despesas da Clínica
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method,
    due_date DATE NOT NULL,
    paid_date DATE,
    status transaction_status NOT NULL DEFAULT 'pendente',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Índices para melhor performance
CREATE INDEX idx_transactions_client_id ON transactions(client_id);
CREATE INDEX idx_transactions_appointment_id ON transactions(appointment_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);
CREATE INDEX idx_payment_plans_client_id ON payment_plans(client_id);
CREATE INDEX idx_installments_payment_plan_id ON installments(payment_plan_id);
CREATE INDEX idx_installments_status ON installments(status);
CREATE INDEX idx_expenses_status ON expenses(status);

-- 7. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at BEFORE UPDATE ON payment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON installments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Habilitar Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 9. Políticas de Segurança (ajuste conforme sua necessidade)
-- Permitir acesso apenas para usuários autenticados

-- Transactions
CREATE POLICY "Usuários autenticados podem ver transações"
    ON transactions FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar transações"
    ON transactions FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar transações"
    ON transactions FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar transações"
    ON transactions FOR DELETE
    USING (auth.role() = 'authenticated');

-- Payment Plans
CREATE POLICY "Usuários autenticados podem ver planos de pagamento"
    ON payment_plans FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar planos de pagamento"
    ON payment_plans FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar planos de pagamento"
    ON payment_plans FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar planos de pagamento"
    ON payment_plans FOR DELETE
    USING (auth.role() = 'authenticated');

-- Installments
CREATE POLICY "Usuários autenticados podem ver parcelas"
    ON installments FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar parcelas"
    ON installments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar parcelas"
    ON installments FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar parcelas"
    ON installments FOR DELETE
    USING (auth.role() = 'authenticated');

-- Expenses
CREATE POLICY "Usuários autenticados podem ver despesas"
    ON expenses FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar despesas"
    ON expenses FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar despesas"
    ON expenses FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar despesas"
    ON expenses FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Após executar, verifique se as tabelas foram criadas:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('transactions', 'payment_plans', 'installments', 'expenses');
-- ============================================
