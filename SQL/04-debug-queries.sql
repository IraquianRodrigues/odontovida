-- ============================================
-- DEBUG - VERIFICAR CONFIGURAÇÃO DE HORÁRIOS
-- ============================================
-- Execute esta query para verificar se há dados nas tabelas

-- 1. Verificar se há horários cadastrados
SELECT 'business_hours' as tabela, COUNT(*) as total FROM business_hours
UNION ALL
SELECT 'business_breaks' as tabela, COUNT(*) as total FROM business_breaks
UNION ALL
SELECT 'business_holidays' as tabela, COUNT(*) as total FROM business_holidays
UNION ALL
SELECT 'business_blocked_slots' as tabela, COUNT(*) as total FROM business_blocked_slots;

-- 2. Ver todos os horários cadastrados
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
  END as dia_semana,
  is_open,
  open_time,
  close_time
FROM business_hours
ORDER BY day_of_week;

-- 3. Testar a query do N8N com data de hoje
WITH target_date AS (
    SELECT CURRENT_DATE as dt
),
info_dia AS (
    SELECT 
        dt, 
        EXTRACT(DOW FROM dt)::INT as dow
    FROM target_date
)
SELECT 
    i.dt as data_consultada,
    i.dow as dia_semana_numero,
    CASE i.dow
      WHEN 0 THEN 'Domingo'
      WHEN 1 THEN 'Segunda'
      WHEN 2 THEN 'Terça'
      WHEN 3 THEN 'Quarta'
      WHEN 4 THEN 'Quinta'
      WHEN 5 THEN 'Sexta'
      WHEN 6 THEN 'Sábado'
    END as dia_semana_nome,
    bh.open_time, 
    bh.close_time, 
    bh.is_open,
    hol.name as nome_feriado,
    CASE 
        WHEN hol.id IS NOT NULL THEN true 
        ELSE false 
    END as eh_feriado,
    COALESCE((
        SELECT json_agg(json_build_object('inicio', bb.break_start, 'fim', bb.break_end, 'motivo', bb.description))
        FROM business_breaks bb
        WHERE bb.day_of_week = i.dow AND bb.is_active = true
    ), '[]'::json) as pausas_padrao,
    COALESCE((
        SELECT json_agg(json_build_object('inicio', bbs.start_time::TIME, 'fim', bbs.end_time::TIME, 'motivo', bbs.reason))
        FROM business_blocked_slots bbs
        WHERE bbs.start_time::DATE = i.dt
    ), '[]'::json) as bloqueios_extras
FROM info_dia i
LEFT JOIN business_hours bh ON bh.day_of_week = i.dow
LEFT JOIN business_holidays hol ON (
    hol.date = i.dt 
    OR (hol.is_recurring = true AND to_char(hol.date, 'MM-DD') = to_char(i.dt, 'MM-DD'))
);
