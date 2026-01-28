-- ============================================
-- CRIAÇÃO DAS TABELAS - BUSINESS HOURS MODULE
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. TABELA: business_hours (Horários de Funcionamento)
CREATE TABLE IF NOT EXISTS business_hours (
  id BIGSERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_open BOOLEAN NOT NULL DEFAULT true,
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '18:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_day_of_week UNIQUE (day_of_week)
);

-- Índices para business_hours
CREATE INDEX IF NOT EXISTS idx_business_hours_day_of_week ON business_hours(day_of_week);

-- Comentários
COMMENT ON TABLE business_hours IS 'Horários de funcionamento por dia da semana (0=Domingo, 6=Sábado)';
COMMENT ON COLUMN business_hours.day_of_week IS '0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado';

-- ============================================

-- 2. TABELA: business_breaks (Intervalos)
CREATE TABLE IF NOT EXISTS business_breaks (
  id BIGSERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  break_start TIME NOT NULL,
  break_end TIME NOT NULL CHECK (break_end > break_start),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para business_breaks
CREATE INDEX IF NOT EXISTS idx_business_breaks_day_of_week ON business_breaks(day_of_week);
CREATE INDEX IF NOT EXISTS idx_business_breaks_active ON business_breaks(is_active) WHERE is_active = true;

-- Comentários
COMMENT ON TABLE business_breaks IS 'Intervalos durante o expediente (almoço, pausas, etc)';

-- ============================================

-- 3. TABELA: business_holidays (Feriados)
CREATE TABLE IF NOT EXISTS business_holidays (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para business_holidays
CREATE INDEX IF NOT EXISTS idx_business_holidays_date ON business_holidays(date);
CREATE INDEX IF NOT EXISTS idx_business_holidays_recurring ON business_holidays(is_recurring) WHERE is_recurring = true;

-- Comentários
COMMENT ON TABLE business_holidays IS 'Feriados e dias de fechamento';
COMMENT ON COLUMN business_holidays.is_recurring IS 'Se true, o feriado se repete todo ano (ex: Natal)';

-- ============================================

-- 4. TABELA: business_blocked_slots (Bloqueios Pontuais)
CREATE TABLE IF NOT EXISTS business_blocked_slots (
  id BIGSERIAL PRIMARY KEY,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL CHECK (end_time > start_time),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para business_blocked_slots
CREATE INDEX IF NOT EXISTS idx_business_blocked_slots_start_time ON business_blocked_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_business_blocked_slots_end_time ON business_blocked_slots(end_time);

-- Comentários
COMMENT ON TABLE business_blocked_slots IS 'Bloqueios pontuais de horários específicos (reuniões, manutenção, etc)';

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

-- Function para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_business_hours_updated_at ON business_hours;
CREATE TRIGGER update_business_hours_updated_at
  BEFORE UPDATE ON business_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_breaks_updated_at ON business_breaks;
CREATE TRIGGER update_business_breaks_updated_at
  BEFORE UPDATE ON business_breaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_holidays_updated_at ON business_holidays;
CREATE TRIGGER update_business_holidays_updated_at
  BEFORE UPDATE ON business_holidays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_blocked_slots_updated_at ON business_blocked_slots;
CREATE TRIGGER update_business_blocked_slots_updated_at
  BEFORE UPDATE ON business_blocked_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'business_%'
ORDER BY table_name;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
