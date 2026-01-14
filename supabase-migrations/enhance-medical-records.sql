-- ============================================
-- ENHANCE MEDICAL RECORDS - Professional SOAP System
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Adicionar novos campos à tabela medical_records
ALTER TABLE medical_records
ADD COLUMN IF NOT EXISTS professional_id INTEGER REFERENCES professionals(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS soap_subjective TEXT,
ADD COLUMN IF NOT EXISTS soap_objective TEXT,
ADD COLUMN IF NOT EXISTS soap_assessment TEXT,
ADD COLUMN IF NOT EXISTS soap_plan TEXT,
ADD COLUMN IF NOT EXISTS vital_signs JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS prescriptions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_medical_records_professional ON medical_records(professional_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment ON medical_records(appointment_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_by ON medical_records(created_by);

-- 3. Atualizar políticas RLS existentes
-- Primeiro, remover políticas antigas
DROP POLICY IF EXISTS "Usuários autenticados podem ver registros médicos" ON medical_records;
DROP POLICY IF EXISTS "Usuários autenticados podem criar registros médicos" ON medical_records;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar registros médicos" ON medical_records;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar registros médicos" ON medical_records;

-- 4. Criar novas políticas RLS baseadas em roles

-- Função auxiliar para obter o ID do profissional do usuário atual
CREATE OR REPLACE FUNCTION get_user_professional_id()
RETURNS INTEGER AS $$
DECLARE
  prof_id INTEGER;
BEGIN
  -- Buscar o ID do profissional baseado no email do usuário autenticado
  SELECT p.id INTO prof_id
  FROM professionals p
  INNER JOIN auth.users u ON p.email = u.email
  WHERE u.id = auth.uid();
  
  RETURN prof_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para obter a role do usuário atual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'recepcionista');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política SELECT: 
-- - Admins veem tudo
-- - Médicos/Dentistas veem apenas seus pacientes
-- - Recepcionistas veem tudo (para gerenciamento)
CREATE POLICY "medical_records_select_policy"
ON medical_records FOR SELECT
USING (
  CASE get_user_role()
    WHEN 'admin' THEN true
    WHEN 'recepcionista' THEN true
    WHEN 'medico' THEN professional_id = get_user_professional_id()
    WHEN 'dentista' THEN professional_id = get_user_professional_id()
    ELSE false
  END
);

-- Política INSERT:
-- - Admins podem inserir
-- - Médicos/Dentistas podem inserir para si mesmos
CREATE POLICY "medical_records_insert_policy"
ON medical_records FOR INSERT
WITH CHECK (
  CASE get_user_role()
    WHEN 'admin' THEN true
    WHEN 'medico' THEN professional_id = get_user_professional_id()
    WHEN 'dentista' THEN professional_id = get_user_professional_id()
    ELSE false
  END
);

-- Política UPDATE:
-- - Admins podem atualizar tudo
-- - Médicos/Dentistas podem atualizar apenas seus próprios registros
CREATE POLICY "medical_records_update_policy"
ON medical_records FOR UPDATE
USING (
  CASE get_user_role()
    WHEN 'admin' THEN true
    WHEN 'medico' THEN professional_id = get_user_professional_id()
    WHEN 'dentista' THEN professional_id = get_user_professional_id()
    ELSE false
  END
);

-- Política DELETE:
-- - Apenas admins podem deletar
-- - Médicos/Dentistas podem deletar seus próprios registros
CREATE POLICY "medical_records_delete_policy"
ON medical_records FOR DELETE
USING (
  CASE get_user_role()
    WHEN 'admin' THEN true
    WHEN 'medico' THEN professional_id = get_user_professional_id()
    WHEN 'dentista' THEN professional_id = get_user_professional_id()
    ELSE false
  END
);

-- 5. Criar view para facilitar consultas de pacientes por profissional
CREATE OR REPLACE VIEW professional_patients AS
SELECT DISTINCT
  p.id as professional_id,
  c.id as client_id,
  c.nome as client_name,
  c.telefone as client_phone,
  MAX(a.start_time) as last_appointment,
  COUNT(a.id) as total_appointments,
  COUNT(mr.id) as total_records
FROM professionals p
INNER JOIN appointments a ON a.professional_code = CAST(p.code AS INTEGER)
INNER JOIN clientes c ON c.telefone = a.customer_phone
LEFT JOIN medical_records mr ON mr.client_id = c.id AND mr.professional_id = p.id
GROUP BY p.id, c.id, c.nome, c.telefone;

-- Habilitar RLS na view
ALTER VIEW professional_patients SET (security_invoker = true);

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar novos campos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'medical_records'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'medical_records';

-- Verificar view
SELECT * FROM professional_patients LIMIT 5;
