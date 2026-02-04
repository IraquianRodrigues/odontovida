-- ============================================
-- CORREÇÃO DO TRIGGER DE NOTIFICAÇÕES
-- ============================================
-- Este script corrige o erro "operator does not exist: text = bigint"
-- Execute no SQL Editor do Supabase
-- ============================================

-- Recriar a função com conversão de tipos correta
CREATE OR REPLACE FUNCTION create_appointment_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_professional_user_id UUID;
  v_service_name TEXT;
  v_customer_name TEXT;
  v_start_time TIMESTAMPTZ;
BEGIN
  -- Buscar o user_id do profissional
  -- CORREÇÃO: Converter professional_code (INTEGER) para TEXT para comparar com code (TEXT)
  SELECT user_id INTO v_professional_user_id
  FROM professionals
  WHERE code = NEW.professional_code::TEXT;

  -- Se não encontrar user_id, apenas retornar sem criar notificação
  -- NÃO bloqueia a criação do agendamento
  IF v_professional_user_id IS NULL THEN
    RAISE NOTICE 'Profissional sem user_id associado. Notificação não criada.';
    RETURN NEW;
  END IF;

  -- Buscar nome do serviço
  -- CORREÇÃO: Converter service_code (INTEGER) para TEXT para comparar com code (TEXT)
  SELECT name INTO v_service_name
  FROM services
  WHERE code = NEW.service_code::TEXT;

  -- Pegar dados do agendamento
  v_customer_name := NEW.customer_name;
  v_start_time := NEW.start_time;

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
      'Novo Agendamento',
      'Agendamento com ' || v_customer_name || ' para ' || 
      COALESCE(v_service_name, 'serviço') || ' em ' || 
      TO_CHAR(v_start_time AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY às HH24:MI')
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Se falhar ao criar notificação, apenas loga mas NÃO bloqueia o agendamento
      RAISE NOTICE 'Erro ao criar notificação: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se o trigger está ativo
SELECT * FROM pg_trigger WHERE tgname = 'trigger_create_appointment_notification';

-- Teste: Verificar tipos das colunas
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('professionals', 'services', 'appointments')
  AND column_name LIKE '%code%'
ORDER BY table_name, column_name;
