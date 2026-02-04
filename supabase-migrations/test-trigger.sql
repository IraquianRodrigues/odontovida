-- ============================================
-- DIAGNÓSTICO COMPLETO DO TRIGGER
-- ============================================
-- Execute cada seção e me envie os resultados
-- ============================================

-- PASSO 1: Ver se o trigger está criando notificações
SELECT 
  a.id as appointment_id,
  a.customer_name,
  a.professional_code,
  a.created_at as appointment_created,
  n.id as notification_id,
  n.title,
  n.message,
  n.created_at as notification_created,
  CASE 
    WHEN n.id IS NULL THEN '❌ NOTIFICAÇÃO NÃO CRIADA'
    ELSE '✅ NOTIFICAÇÃO CRIADA'
  END as status
FROM appointments a
LEFT JOIN notifications n ON n.appointment_id = a.id
ORDER BY a.created_at DESC
LIMIT 5;

-- PASSO 2: Ver se o profissional code '10' tem user_id agora
SELECT 
  code,
  name,
  user_id,
  CASE 
    WHEN user_id IS NULL THEN '❌ SEM USER_ID'
    ELSE '✅ COM USER_ID'
  END as status
FROM professionals
WHERE code = '10';

-- PASSO 3: Ver os logs do PostgreSQL (se houver erro no trigger)
-- Verificar se a função está correta
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE proname = 'create_appointment_notification';

-- PASSO 4: Testar o trigger manualmente
-- Criar um agendamento de teste via SQL
INSERT INTO appointments (
  customer_name,
  customer_phone,
  service_code,
  professional_code,
  start_time,
  end_time,
  status
) VALUES (
  'Teste Trigger',
  '11999999999',
  3,  -- Substitua por um service_code válido
  10,
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '30 minutes',
  'agendado'
);

-- PASSO 5: Verificar se a notificação foi criada
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;
