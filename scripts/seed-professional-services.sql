-- Script opcional para popular a tabela professional_services com dados de exemplo
-- Execute este script APENAS se quiser dados de teste
-- IMPORTANTE: Ajuste os IDs conforme seus dados reais

-- Exemplo: Associar serviços aos profissionais
-- Substitua os IDs pelos valores reais do seu banco

-- Suponha que temos:
-- Profissionais: 1 (Dr. João), 2 (Dra. Maria), 3 (Dr. Pedro)
-- Serviços: 1 (Consulta Geral - 30min), 2 (Exame Rotina - 45min), 3 (Procedimento - 60min)

-- Dr. João pode fazer todos os serviços com durações padrão
INSERT INTO professional_services (professional_id, service_id, custom_duration_minutes, is_active)
VALUES 
  (1, 1, 30, true),  -- Consulta Geral: 30min
  (1, 2, 45, true),  -- Exame Rotina: 45min
  (1, 3, 60, true);  -- Procedimento: 60min

-- Dra. Maria faz apenas consultas, mas demora mais
INSERT INTO professional_services (professional_id, service_id, custom_duration_minutes, is_active)
VALUES 
  (2, 1, 45, true),  -- Consulta Geral: 45min (mais detalhada)
  (2, 2, 60, true);  -- Exame Rotina: 60min (mais cuidadosa)

-- Dr. Pedro é especialista em procedimentos
INSERT INTO professional_services (professional_id, service_id, custom_duration_minutes, is_active)
VALUES 
  (3, 1, 25, true),  -- Consulta Geral: 25min (rápido)
  (3, 3, 90, true);  -- Procedimento: 90min (muito detalhado)

-- Verificar os dados inseridos
SELECT 
  ps.id,
  p.name as profissional,
  s.code as servico,
  ps.custom_duration_minutes as duracao_minutos,
  ps.is_active as ativo
FROM professional_services ps
JOIN professionals p ON ps.professional_id = p.id
JOIN services s ON ps.service_id = s.id
ORDER BY p.name, s.code;

