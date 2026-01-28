-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS) - BUSINESS HOURS MODULE
-- ============================================
-- Execute este script APÓS criar as tabelas
-- ============================================

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_blocked_slots ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA: business_hours
-- ============================================

-- SELECT: Usuários autenticados podem visualizar
DROP POLICY IF EXISTS "Authenticated users can view business_hours" ON business_hours;
CREATE POLICY "Authenticated users can view business_hours"
  ON business_hours FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: Usuários autenticados podem inserir
DROP POLICY IF EXISTS "Authenticated users can insert business_hours" ON business_hours;
CREATE POLICY "Authenticated users can insert business_hours"
  ON business_hours FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Usuários autenticados podem atualizar
DROP POLICY IF EXISTS "Authenticated users can update business_hours" ON business_hours;
CREATE POLICY "Authenticated users can update business_hours"
  ON business_hours FOR UPDATE
  USING (auth.role() = 'authenticated');

-- DELETE: Usuários autenticados podem deletar
DROP POLICY IF EXISTS "Authenticated users can delete business_hours" ON business_hours;
CREATE POLICY "Authenticated users can delete business_hours"
  ON business_hours FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA: business_breaks
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view business_breaks" ON business_breaks;
CREATE POLICY "Authenticated users can view business_breaks"
  ON business_breaks FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert business_breaks" ON business_breaks;
CREATE POLICY "Authenticated users can insert business_breaks"
  ON business_breaks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update business_breaks" ON business_breaks;
CREATE POLICY "Authenticated users can update business_breaks"
  ON business_breaks FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete business_breaks" ON business_breaks;
CREATE POLICY "Authenticated users can delete business_breaks"
  ON business_breaks FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA: business_holidays
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view business_holidays" ON business_holidays;
CREATE POLICY "Authenticated users can view business_holidays"
  ON business_holidays FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert business_holidays" ON business_holidays;
CREATE POLICY "Authenticated users can insert business_holidays"
  ON business_holidays FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update business_holidays" ON business_holidays;
CREATE POLICY "Authenticated users can update business_holidays"
  ON business_holidays FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete business_holidays" ON business_holidays;
CREATE POLICY "Authenticated users can delete business_holidays"
  ON business_holidays FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA: business_blocked_slots
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view business_blocked_slots" ON business_blocked_slots;
CREATE POLICY "Authenticated users can view business_blocked_slots"
  ON business_blocked_slots FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert business_blocked_slots" ON business_blocked_slots;
CREATE POLICY "Authenticated users can insert business_blocked_slots"
  ON business_blocked_slots FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update business_blocked_slots" ON business_blocked_slots;
CREATE POLICY "Authenticated users can update business_blocked_slots"
  ON business_blocked_slots FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete business_blocked_slots" ON business_blocked_slots;
CREATE POLICY "Authenticated users can delete business_blocked_slots"
  ON business_blocked_slots FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'business_%'
ORDER BY tablename, policyname;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
