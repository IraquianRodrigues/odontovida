-- ============================================
-- ENHANCED RLS POLICIES - Role-Based Access Control
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. HELPER FUNCTION: Get User Role
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'recepcionista');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. TRANSACTIONS TABLE - Enhanced RLS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários autenticados podem ver transações" ON transactions;
DROP POLICY IF EXISTS "Usuários autenticados podem criar transações" ON transactions;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar transações" ON transactions;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar transações" ON transactions;

-- ADMINS: Acesso total
CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update transactions"
  ON transactions FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete transactions"
  ON transactions FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- DENTISTAS: Apenas visualizar transações relacionadas aos seus atendimentos
CREATE POLICY "Dentists can view their transactions"
  ON transactions FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'dentista' AND
    professional_id::text = auth.uid()::text
  );

-- RECEPCIONISTAS: Apenas visualizar (sem editar valores)
CREATE POLICY "Receptionists can view transactions"
  ON transactions FOR SELECT
  USING (get_user_role(auth.uid()) = 'recepcionista');

-- ============================================
-- 3. USER PROFILES - Enhanced RLS
-- ============================================

-- Já existem políticas básicas, vamos adicionar para admins

-- ADMINS: Podem ver todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

-- ADMINS: Podem atualizar roles de outros usuários
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin');

-- ============================================
-- 4. CLIENTS (CLIENTES) - Enhanced RLS
-- ============================================

-- Verificar se RLS está habilitado
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Authenticated users can view clients" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON clientes;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON clientes;

-- Todos os usuários autenticados podem ver clientes
CREATE POLICY "Authenticated users can view clients"
  ON clientes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Todos os usuários autenticados podem criar clientes
CREATE POLICY "Authenticated users can create clients"
  ON clientes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Todos os usuários autenticados podem atualizar clientes
CREATE POLICY "Authenticated users can update clients"
  ON clientes FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Apenas admins podem deletar clientes
CREATE POLICY "Only admins can delete clients"
  ON clientes FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- ============================================
-- 5. APPOINTMENTS (AGENDAMENTOS) - Enhanced RLS
-- ============================================

-- Verificar se RLS está habilitado
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON appointments;

-- ADMINS e RECEPCIONISTAS: Acesso total
CREATE POLICY "Admins and receptionists can view all appointments"
  ON appointments FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('admin', 'recepcionista')
  );

CREATE POLICY "Admins and receptionists can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'recepcionista')
  );

CREATE POLICY "Admins and receptionists can update appointments"
  ON appointments FOR UPDATE
  USING (
    get_user_role(auth.uid()) IN ('admin', 'recepcionista')
  );

CREATE POLICY "Admins can delete appointments"
  ON appointments FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- DENTISTAS: Podem ver e atualizar agendamentos (sem restrição por profissional por enquanto)
-- Nota: Para implementar restrição por profissional, a tabela professionals precisa ter coluna user_id
CREATE POLICY "Dentists can view appointments"
  ON appointments FOR SELECT
  USING (get_user_role(auth.uid()) = 'dentista');

CREATE POLICY "Dentists can update appointments"
  ON appointments FOR UPDATE
  USING (get_user_role(auth.uid()) = 'dentista');

-- ============================================
-- 6. PROFESSIONALS (PROFISSIONAIS) - Enhanced RLS
-- ============================================

-- Verificar se RLS está habilitado
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Authenticated users can view professionals" ON professionals;
DROP POLICY IF EXISTS "Authenticated users can create professionals" ON professionals;
DROP POLICY IF EXISTS "Authenticated users can update professionals" ON professionals;
DROP POLICY IF EXISTS "Authenticated users can delete professionals" ON professionals;

-- Todos podem visualizar profissionais
CREATE POLICY "Authenticated users can view professionals"
  ON professionals FOR SELECT
  USING (auth.role() = 'authenticated');

-- Apenas admins podem criar/editar/deletar profissionais
CREATE POLICY "Only admins can create professionals"
  ON professionals FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can update professionals"
  ON professionals FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete professionals"
  ON professionals FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- ============================================
-- 7. SERVICES (SERVICOS) - Enhanced RLS
-- ============================================

-- Verificar se RLS está habilitado
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Authenticated users can view services" ON services;
DROP POLICY IF EXISTS "Authenticated users can create services" ON services;
DROP POLICY IF EXISTS "Authenticated users can update services" ON services;
DROP POLICY IF EXISTS "Authenticated users can delete services" ON services;

-- Todos podem visualizar serviços
CREATE POLICY "Authenticated users can view services"
  ON services FOR SELECT
  USING (auth.role() = 'authenticated');

-- Apenas admins podem criar/editar/deletar serviços
CREATE POLICY "Only admins can create services"
  ON services FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can update services"
  ON services FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete services"
  ON services FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Testar se as políticas estão funcionando:
-- SELECT * FROM transactions; -- Deve respeitar as regras de role
-- SELECT * FROM user_profiles; -- Deve mostrar apenas perfil próprio ou todos se admin
