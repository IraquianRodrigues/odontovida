-- ============================================
-- TESTE COMPLETO DE NOTIFICAÇÕES
-- ============================================
-- Execute cada seção separadamente e verifique os resultados
-- ============================================

-- PASSO 1: Verificar se há notificações no banco
-- ============================================
SELECT 
  id,
  user_id,
  title,
  message,
  read_at,
  created_at,
  appointment_id
FROM notifications
ORDER BY created_at DESC
LIMIT 10;

-- Se não houver notificações, o trigger não está funcionando
-- Se houver notificações, o problema está no frontend


-- PASSO 2: Verificar o user_id do usuário logado
-- ============================================
-- Copie o user_id que você está usando no frontend
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;


-- PASSO 3: Criar uma notificação de teste MANUALMENTE
-- ============================================
-- Substitua 'SEU_USER_ID_AQUI' pelo user_id do PASSO 2
-- Esta notificação deve aparecer IMEDIATAMENTE no frontend se o Realtime estiver funcionando

INSERT INTO notifications (
  user_id,
  title,
  message
) VALUES (
  '5924142f-b18f-48f9-b9a3-6b31d3d61c78',  -- SUBSTITUA pelo seu user_id
  '🔔 Teste de Notificação',
  'Se você está vendo isso, o sistema de notificações está funcionando!'
);

-- Após executar, verifique se a notificação apareceu no sino (bell) do header


-- PASSO 4: Verificar se o Realtime está habilitado
-- ============================================
-- Execute esta query para ver a configuração da tabela
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'notifications';

-- IMPORTANTE: Vá em Supabase Dashboard → Database → Replication
-- E certifique-se de que a tabela "notifications" está com Realtime HABILITADO


-- PASSO 5: Verificar os últimos agendamentos e seus profissionais
-- ============================================
SELECT 
  a.id,
  a.customer_name,
  a.professional_code,
  p.name as professional_name,
  p.user_id as professional_user_id,
  a.created_at,
  CASE 
    WHEN p.user_id IS NULL THEN '❌ Profissional sem user_id - Notificação NÃO será criada'
    ELSE '✅ Profissional com user_id - Notificação SERÁ criada'
  END as notification_status
FROM appointments a
LEFT JOIN professionals p ON p.code = a.professional_code::TEXT
ORDER BY a.created_at DESC
LIMIT 5;


-- PASSO 6: Verificar se há notificações para os agendamentos criados
-- ============================================
SELECT 
  a.id as appointment_id,
  a.customer_name,
  a.created_at as appointment_created_at,
  n.id as notification_id,
  n.title as notification_title,
  n.created_at as notification_created_at,
  CASE 
    WHEN n.id IS NULL THEN '❌ SEM NOTIFICAÇÃO'
    ELSE '✅ COM NOTIFICAÇÃO'
  END as status
FROM appointments a
LEFT JOIN notifications n ON n.appointment_id = a.id
ORDER BY a.created_at DESC
LIMIT 10;


-- ============================================
-- DIAGNÓSTICO DE PROBLEMAS
-- ============================================

-- Se PASSO 1 retornar vazio:
--   → O trigger não está criando notificações
--   → Verifique se o profissional tem user_id (PASSO 5)

-- Se PASSO 1 retornar notificações MAS elas não aparecem no frontend:
--   → Problema no Realtime ou no frontend
--   → Execute PASSO 3 e veja se aparece imediatamente
--   → Se não aparecer, o Realtime não está habilitado (PASSO 4)

-- Se PASSO 3 criar notificação mas não aparecer:
--   → Verifique se o user_id está correto
--   → Verifique se você está logado com o mesmo usuário
--   → Verifique o console do navegador (F12) para erros

-- Se PASSO 6 mostrar agendamentos SEM notificação:
--   → O profissional não tem user_id associado
--   → Execute: UPDATE professionals SET user_id = 'SEU_USER_ID' WHERE code = 'CODIGO_DO_PROFISSIONAL';
