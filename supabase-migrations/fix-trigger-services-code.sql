-- ============================================
-- CORREÇÃO DEFINITIVA DO TRIGGER DE NOTIFICAÇÕES
-- ============================================
-- Este script corrige o erro da coluna "name" em services
-- que estava impedindo o trigger de funcionar
-- ============================================

-- PASSO 1: Remover trigger e função existentes
DROP TRIGGER IF EXISTS trigger_create_appointment_notification ON appointments;
DROP FUNCTION IF EXISTS create_appointment_notification();

-- PASSO 2: Criar função CORRIGIDA
CREATE OR REPLACE FUNCTION create_appointment_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_professional_user_id UUID;
  v_professional_name TEXT;
  v_service_code TEXT;
  v_customer_name TEXT;
  v_start_time TIMESTAMPTZ;
  v_notification_title TEXT;
  v_notification_message TEXT;
  v_day_of_week TEXT;
  v_formatted_date TEXT;
  v_formatted_time TEXT;
BEGIN
  -- Log para debug
  RAISE NOTICE 'Trigger executado para appointment ID: %', NEW.id;

  -- Buscar dados do profissional (professional_code é o ID, não o código string!)
  SELECT user_id, name INTO v_professional_user_id, v_professional_name
  FROM professionals
  WHERE id = NEW.professional_code;

  RAISE NOTICE 'Professional user_id: %, name: %', v_professional_user_id, v_professional_name;

  -- Se não encontrar user_id, apenas retornar sem criar notificação
  IF v_professional_user_id IS NULL THEN
    RAISE NOTICE 'Profissional sem user_id associado. Notificação não criada.';
    RETURN NEW;
  END IF;

  -- Buscar código do serviço (service_code é o ID, não o código string!)
  SELECT code INTO v_service_code
  FROM services
  WHERE id = NEW.service_code;

  -- Pegar dados do agendamento
  v_customer_name := NEW.customer_name;
  v_start_time := NEW.start_time;

  -- Formatar dia da semana em português
  v_day_of_week := CASE EXTRACT(DOW FROM v_start_time AT TIME ZONE 'America/Sao_Paulo')
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda-feira'
    WHEN 2 THEN 'Terça-feira'
    WHEN 3 THEN 'Quarta-feira'
    WHEN 4 THEN 'Quinta-feira'
    WHEN 5 THEN 'Sexta-feira'
    WHEN 6 THEN 'Sábado'
  END;

  -- Formatar data (ex: 04/02/2026)
  v_formatted_date := TO_CHAR(v_start_time AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY');
  
  -- Formatar hora (ex: 14:30)
  v_formatted_time := TO_CHAR(v_start_time AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI');

  -- Criar título da notificação
  v_notification_title := '🗓️ Novo Agendamento';

  -- Criar mensagem formatada (usando 'code' do serviço ao invés de 'name')
  v_notification_message := 
    '👤 Paciente: ' || v_customer_name || E'\n' ||
    '💼 Serviço: ' || COALESCE(v_service_code, 'Não especificado') || E'\n' ||
    '📅 Data: ' || v_day_of_week || ', ' || v_formatted_date || E'\n' ||
    '🕐 Horário: ' || v_formatted_time || E'\n' ||
    '👨‍⚕️ Profissional: ' || v_professional_name;

  RAISE NOTICE 'Mensagem criada: %', v_notification_message;

  -- Tentar criar notificação com tratamento de erro
  BEGIN
    INSERT INTO notifications (
      user_id,
      appointment_id,
      title,
      message
    ) VALUES (
      v_professional_user_id,
      NEW.id,
      v_notification_title,
      v_notification_message
    );
    
    RAISE NOTICE 'Notificação criada com sucesso para o agendamento ID: %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao criar notificação: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 3: Criar trigger
CREATE TRIGGER trigger_create_appointment_notification
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_appointment_notification();

-- PASSO 4: Verificar se foi criado corretamente
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

-- PASSO 5: Teste - Criar um agendamento
-- IMPORTANTE: Ajuste os códigos para valores válidos do seu banco
INSERT INTO appointments (
  customer_name,
  customer_phone,
  service_code,
  professional_code,
  start_time,
  end_time,
  status
) VALUES (
  'Teste Trigger Corrigido',
  '11999999999',
  (SELECT id FROM services LIMIT 1),
  (SELECT id FROM professionals WHERE user_id IS NOT NULL LIMIT 1),
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '1 hour',
  'agendado'
);

-- PASSO 6: Verificar se a notificação foi criada
SELECT 
  id,
  user_id,
  appointment_id,
  title,
  message,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 1;

-- Se aparecer a notificação, o trigger está funcionando! 🎉
