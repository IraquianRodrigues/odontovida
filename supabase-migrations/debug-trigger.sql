-- ============================================
-- DIAGNÓSTICO: Por que o trigger não dispara?
-- ============================================
-- Execute este script para verificar o problema
-- ============================================

-- 1. Verificar se o trigger está realmente ativo
SELECT 
  tgname as trigger_name,
  tgenabled,
  CASE tgenabled
    WHEN 'O' THEN '✅ Habilitado'
    WHEN 'D' THEN '❌ Desabilitado'
    WHEN 'R' THEN '⚠️ Habilitado apenas para réplica'
    WHEN 'A' THEN '⚠️ Habilitado apenas para always'
    ELSE '⚠️ Status: ' || tgenabled
  END as status,
  tgtype,
  CASE 
    WHEN tgtype::int & 2 = 2 THEN 'BEFORE'
    WHEN tgtype::int & 64 = 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END as timing,
  CASE 
    WHEN tgtype::int & 4 = 4 THEN 'INSERT'
    WHEN tgtype::int & 8 = 8 THEN 'DELETE'
    WHEN tgtype::int & 16 = 16 THEN 'UPDATE'
    ELSE 'UNKNOWN'
  END as event
FROM pg_trigger 
WHERE tgname = 'trigger_create_appointment_notification';

-- 2. Verificar se há OUTROS triggers na tabela appointments
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger 
WHERE tgrelid = 'appointments'::regclass
ORDER BY tgname;

-- 3. Testar o trigger manualmente com RAISE NOTICE
-- Primeiro, vamos ver os logs do Postgres
-- Execute este INSERT e depois verifique os logs no Supabase Dashboard → Logs

INSERT INTO appointments (
  customer_name,
  customer_phone,
  service_code,
  professional_code,
  start_time,
  end_time,
  status
) VALUES (
  'TESTE TRIGGER DEBUG',
  '11999999999',
  (SELECT id FROM services LIMIT 1),
  (SELECT code FROM professionals WHERE user_id IS NOT NULL LIMIT 1),
  NOW() + INTERVAL '2 hours',
  NOW() + INTERVAL '3 hours',
  'agendado'
) RETURNING id;

-- 4. Verificar se a notificação foi criada
SELECT 
  n.id,
  n.user_id,
  n.appointment_id,
  n.title,
  LEFT(n.message, 100) as message_preview,
  n.created_at,
  a.customer_name,
  a.status as appointment_status
FROM notifications n
LEFT JOIN appointments a ON a.id = n.appointment_id
WHERE a.customer_name = 'TESTE TRIGGER DEBUG'
ORDER BY n.created_at DESC;

-- 5. Se não aparecer notificação, o problema pode ser:
-- a) O profissional não tem user_id
-- b) O trigger não está disparando
-- c) Há um erro silencioso na função

-- Verificar profissionais com user_id
SELECT 
  code,
  name,
  user_id,
  CASE 
    WHEN user_id IS NULL THEN '❌ SEM USER_ID'
    ELSE '✅ OK'
  END as status
FROM professionals;
