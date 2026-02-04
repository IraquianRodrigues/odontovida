-- ============================================
-- SISTEMA DE NOTIFICAÇÕES EM TEMPO REAL
-- ============================================
-- Cria tabela de notificações e trigger automático
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS - Usuários veem apenas suas notificações
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- 5. Criar função para gerar notificação quando novo agendamento for criado
-- IMPORTANTE: Usa EXCEPTION HANDLING para não bloquear criação de agendamentos
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

-- 6. Criar trigger para executar a função
DROP TRIGGER IF EXISTS trigger_create_appointment_notification ON appointments;
CREATE TRIGGER trigger_create_appointment_notification
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_appointment_notification();

-- 7. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- ============================================
-- HABILITAR REALTIME (IMPORTANTE!)
-- ============================================
-- Após executar este script, vá em:
-- Supabase Dashboard → Database → Replication
-- E habilite Realtime para a tabela "notifications"
-- ============================================

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Verifique se a tabela foi criada:
-- SELECT * FROM notifications LIMIT 5;

-- Verifique se o trigger está ativo:
-- SELECT * FROM pg_trigger WHERE tgname = 'trigger_create_appointment_notification';

-- Verifique se os profissionais têm user_id:
-- SELECT code, name, user_id FROM professionals;

-- Se algum profissional não tiver user_id, você pode associar assim:
-- UPDATE professionals SET user_id = 'SEU_USER_ID_AQUI' WHERE code = CODIGO_DO_PROFISSIONAL;

-- Teste criando um agendamento e verificando se a notificação foi criada
-- ============================================
