-- ============================================
-- AUDIT LOGGING SYSTEM
-- ============================================
-- Sistema de auditoria para rastrear ações sensíveis
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_role TEXT,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 3. Habilitar RLS na tabela de audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acesso aos logs (apenas admins)
CREATE POLICY "Only admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Ninguém pode deletar ou editar logs (apenas inserir via triggers)
CREATE POLICY "No one can delete audit logs"
    ON audit_logs FOR DELETE
    USING (false);

CREATE POLICY "No one can update audit logs"
    ON audit_logs FOR UPDATE
    USING (false);

-- Sistema pode inserir logs
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================
-- 5. FUNÇÃO GENÉRICA DE AUDITORIA
-- ============================================
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    user_email_var TEXT;
    user_role_var TEXT;
BEGIN
    -- Obter email e role do usuário
    SELECT email, role INTO user_email_var, user_role_var
    FROM user_profiles
    WHERE id = auth.uid();

    -- Inserir log de auditoria
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (
            user_id,
            user_email,
            user_role,
            action,
            table_name,
            record_id,
            old_data,
            new_data
        ) VALUES (
            auth.uid(),
            user_email_var,
            user_role_var,
            'DELETE',
            TG_TABLE_NAME,
            OLD.id::text,
            row_to_json(OLD),
            NULL
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (
            user_id,
            user_email,
            user_role,
            action,
            table_name,
            record_id,
            old_data,
            new_data
        ) VALUES (
            auth.uid(),
            user_email_var,
            user_role_var,
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id::text,
            row_to_json(OLD),
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (
            user_id,
            user_email,
            user_role,
            action,
            table_name,
            record_id,
            old_data,
            new_data
        ) VALUES (
            auth.uid(),
            user_email_var,
            user_role_var,
            'INSERT',
            TG_TABLE_NAME,
            NEW.id::text,
            NULL,
            row_to_json(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. APLICAR TRIGGERS DE AUDITORIA
-- ============================================

-- Auditoria para TRANSACTIONS (todas as operações)
DROP TRIGGER IF EXISTS audit_transactions_trigger ON transactions;
CREATE TRIGGER audit_transactions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Auditoria para USER_PROFILES (mudanças de role são críticas)
DROP TRIGGER IF EXISTS audit_user_profiles_trigger ON user_profiles;
CREATE TRIGGER audit_user_profiles_trigger
    AFTER UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Auditoria para CLIENTES (apenas DELETE)
DROP TRIGGER IF EXISTS audit_clientes_trigger ON clientes;
CREATE TRIGGER audit_clientes_trigger
    AFTER DELETE ON clientes
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Auditoria para PROFISSIONAIS (todas as operações)
DROP TRIGGER IF EXISTS audit_profissionais_trigger ON professionals;
CREATE TRIGGER audit_profissionais_trigger
    AFTER INSERT OR UPDATE OR DELETE ON professionals
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================
-- 7. FUNÇÃO HELPER PARA CONSULTAR LOGS
-- ============================================
CREATE OR REPLACE FUNCTION get_audit_logs_for_record(
    p_table_name TEXT,
    p_record_id TEXT
)
RETURNS TABLE (
    id UUID,
    user_email TEXT,
    user_role TEXT,
    action TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.user_email,
        al.user_role,
        al.action,
        al.old_data,
        al.new_data,
        al.created_at
    FROM audit_logs al
    WHERE al.table_name = p_table_name
    AND al.record_id = p_record_id
    ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Ver todos os logs (apenas admins):
-- SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50;

-- Ver logs de uma transação específica:
-- SELECT * FROM get_audit_logs_for_record('transactions', 'uuid-da-transacao');

-- Ver logs de um usuário específico:
-- SELECT * FROM audit_logs WHERE user_id = 'uuid-do-usuario' ORDER BY created_at DESC;
