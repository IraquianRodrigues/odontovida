-- ============================================
-- MELHORAR MENSAGEM DE NOTIFICAÇÃO
-- ============================================
-- Atualiza o trigger para criar notificações com
-- informações completas e bem formatadas
-- ============================================

CREATE OR REPLACE FUNCTION create_appointment_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_professional_user_id UUID;
  v_professional_name TEXT;
  v_service_name TEXT;
  v_customer_name TEXT;
  v_start_time TIMESTAMPTZ;
  v_notification_title TEXT;
  v_notification_message TEXT;
  v_day_of_week TEXT;
  v_formatted_date TEXT;
  v_formatted_time TEXT;
BEGIN
  -- Buscar dados do profissional
  SELECT user_id, name INTO v_professional_user_id, v_professional_name
  FROM professionals
  WHERE code = NEW.professional_code::TEXT;

  -- Se não encontrar user_id, apenas retornar sem criar notificação
  IF v_professional_user_id IS NULL THEN
    RAISE NOTICE 'Profissional sem user_id associado. Notificação não criada.';
    RETURN NEW;
  END IF;

  -- Buscar nome do serviço
  SELECT name INTO v_service_name
  FROM services
  WHERE code = NEW.service_code::TEXT;

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

  -- Criar mensagem formatada
  v_notification_message := 
    '👤 Paciente: ' || v_customer_name || E'\n' ||
    '💼 Serviço: ' || COALESCE(v_service_name, 'Não especificado') || E'\n' ||
    '📅 Data: ' || v_day_of_week || ', ' || v_formatted_date || E'\n' ||
    '🕐 Horário: ' || v_formatted_time || E'\n' ||
    '👨‍⚕️ Profissional: ' || v_professional_name;

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

-- Verificar se o trigger está ativo
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

-- Teste: Ver a última notificação criada
SELECT 
  id,
  title,
  message,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 1;
