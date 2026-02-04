-- ============================================
-- SCRIPT DE VERIFICAÇÃO DO SISTEMA DE NOTIFICAÇÕES
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para diagnosticar problemas no sistema de notificações
-- ============================================

-- PASSO 1: Verificar se a tabela notifications existe
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'notifications' THEN '✅ Tabela existe'
    ELSE '❌ Tabela não encontrada'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'notifications';

-- PASSO 2: Verificar se o trigger está ativo
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  CASE tgenabled
    WHEN 'O' THEN '✅ Habilitado'
    WHEN 'D' THEN '❌ Desabilitado'
    ELSE '⚠️ Status desconhecido'
  END as status
FROM pg_trigger 
WHERE tgname = 'trigger_create_appointment_notification';

-- PASSO 3: Verificar profissionais e seus user_id
SELECT 
  code,
  name,
  user_id,
  CASE 
    WHEN user_id IS NULL THEN '❌ SEM USER_ID - Notificações não funcionarão!'
    ELSE '✅ Tem user_id'
  END as status
FROM professionals
ORDER BY code;

-- PASSO 4: Verificar últimas notificações criadas
SELECT 
  id,
  user_id,
  appointment_id,
  title,
  LEFT(message, 50) || '...' as message_preview,
  read_at,
  created_at,
  CASE 
    WHEN read_at IS NULL THEN '📬 Não lida'
    ELSE '✅ Lida'
  END as status
FROM notifications
ORDER BY created_at DESC
LIMIT 10;

-- PASSO 5: Contar notificações por usuário
SELECT 
  user_id,
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN read_at IS NULL THEN 1 END) as unread_count,
  COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END) as read_count
FROM notifications
GROUP BY user_id;

-- PASSO 6: Verificar RLS (Row Level Security)
SELECT 
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '✅ RLS habilitado'
    ELSE '❌ RLS desabilitado'
  END as status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'notifications';

-- PASSO 7: Verificar políticas RLS
SELECT 
  policyname as policy_name,
  cmd as command,
  qual as condition,
  CASE 
    WHEN policyname LIKE '%view%' THEN '👁️ Visualização'
    WHEN policyname LIKE '%update%' THEN '✏️ Atualização'
    WHEN policyname LIKE '%insert%' THEN '➕ Inserção'
    ELSE '📋 Outra'
  END as type
FROM pg_policies
WHERE tablename = 'notifications';

-- ============================================
-- DIAGNÓSTICO FINAL
-- ============================================

-- Se você vir:
-- ✅ Tabela existe
-- ✅ Trigger habilitado
-- ✅ Profissionais têm user_id
-- ✅ RLS habilitado
-- ✅ Notificações sendo criadas

-- E AINDA ASSIM as notificações não aparecem no frontend:
-- → O problema está no REALTIME do Supabase!
-- → Vá em: Supabase Dashboard → Database → Replication
-- → Habilite Realtime para a tabela "notifications"

-- ============================================
-- TESTE MANUAL
-- ============================================
-- Crie um agendamento de teste e veja se a notificação é criada:

-- Primeiro, pegue um professional_code e service_code válidos:
SELECT code, name FROM professionals LIMIT 1;
SELECT id as code, code as service_name FROM services LIMIT 1;

-- Depois, crie um agendamento de teste (ajuste os códigos):
/*
INSERT INTO appointments (
  customer_name,
  customer_phone,
  service_code,
  professional_code,
  start_time,
  end_time,
  status
) VALUES (
  'Teste Sistema Notificações',
  '11999999999',
  3,  -- Ajuste para um service_code válido
  10, -- Ajuste para um professional_code válido
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '1 hour',
  'agendado'
);
*/

-- Verifique se a notificação foi criada:
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;
