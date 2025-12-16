-- Cria tabela de associação entre profissionais e serviços
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS professional_services (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  custom_duration_minutes INTEGER NOT NULL CHECK (custom_duration_minutes > 0),
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Garante que cada profissional só pode ter uma associação com cada serviço
  CONSTRAINT unique_professional_service UNIQUE (professional_id, service_id)
);

-- Índices para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_professional_services_professional_id 
  ON professional_services(professional_id);
  
CREATE INDEX IF NOT EXISTS idx_professional_services_service_id 
  ON professional_services(service_id);

CREATE INDEX IF NOT EXISTS idx_professional_services_active 
  ON professional_services(is_active) WHERE is_active = true;

-- Comentários
COMMENT ON TABLE professional_services IS 'Associação entre profissionais e serviços com duração customizada';
COMMENT ON COLUMN professional_services.professional_id IS 'ID do profissional';
COMMENT ON COLUMN professional_services.service_id IS 'ID do serviço';
COMMENT ON COLUMN professional_services.custom_duration_minutes IS 'Duração customizada em minutos para este profissional realizar este serviço';
COMMENT ON COLUMN professional_services.is_active IS 'Se o profissional está ativo para realizar este serviço';
