-- ============================================
-- SEED INICIAL - BUSINESS HOURS
-- ============================================
-- Este script popula dados iniciais para o sistema de horários
-- Execute no SQL Editor do Supabase após criar as tabelas

-- 1. LIMPAR DADOS EXISTENTES (CUIDADO!)
-- DELETE FROM business_hours;
-- DELETE FROM business_breaks;
-- DELETE FROM business_holidays;
-- DELETE FROM business_blocked_slots;

-- 2. INSERIR HORÁRIOS PADRÃO (Segunda a Sexta: 9h-18h, Sábado: 9h-13h)
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time) VALUES
  (0, false, '09:00', '18:00'), -- Domingo - FECHADO
  (1, true, '09:00', '18:00'),  -- Segunda
  (2, true, '09:00', '18:00'),  -- Terça
  (3, true, '09:00', '18:00'),  -- Quarta
  (4, true, '09:00', '18:00'),  -- Quinta
  (5, true, '09:00', '18:00'),  -- Sexta
  (6, true, '09:00', '13:00')   -- Sábado - meio período
ON CONFLICT (day_of_week) DO UPDATE SET
  is_open = EXCLUDED.is_open,
  open_time = EXCLUDED.open_time,
  close_time = EXCLUDED.close_time;

-- 3. INSERIR INTERVALO DE ALMOÇO (Segunda a Sexta: 12h-13h)
INSERT INTO business_breaks (day_of_week, break_start, break_end, description, is_active) VALUES
  (1, '12:00', '13:00', 'Almoço', true),
  (2, '12:00', '13:00', 'Almoço', true),
  (3, '12:00', '13:00', 'Almoço', true),
  (4, '12:00', '13:00', 'Almoço', true),
  (5, '12:00', '13:00', 'Almoço', true);

-- 4. VERIFICAR DADOS INSERIDOS
SELECT 
  day_of_week,
  CASE day_of_week
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda'
    WHEN 2 THEN 'Terça'
    WHEN 3 THEN 'Quarta'
    WHEN 4 THEN 'Quinta'
    WHEN 5 THEN 'Sexta'
    WHEN 6 THEN 'Sábado'
  END as dia,
  is_open as aberto,
  open_time as abre,
  close_time as fecha
FROM business_hours
ORDER BY day_of_week;

-- 5. VERIFICAR INTERVALOS
SELECT 
  day_of_week,
  CASE day_of_week
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda'
    WHEN 2 THEN 'Terça'
    WHEN 3 THEN 'Quarta'
    WHEN 4 THEN 'Quinta'
    WHEN 5 THEN 'Sexta'
    WHEN 6 THEN 'Sábado'
  END as dia,
  break_start as inicio,
  break_end as fim,
  description as descricao
FROM business_breaks
WHERE is_active = true
ORDER BY day_of_week;
