-- =====================================================
-- TESTE MANUAL DE CRIAÇÃO DE ODONTOGRAMA
-- =====================================================
-- Execute este script linha por linha no Supabase SQL Editor
-- para identificar onde está o problema

-- 1. Verificar se você está logado e é dentista
SELECT 
  auth.uid() as my_user_id,
  (SELECT role FROM user_profiles WHERE id = auth.uid()) as my_role;

-- Se o resultado acima mostrar NULL ou não for 'dentista', pare aqui e corrija primeiro

-- 2. Verificar se há pacientes disponíveis
SELECT id, nome FROM clientes LIMIT 5;

-- 3. Tentar criar um odontograma manualmente (substitua 1 pelo ID de um paciente real)
-- IMPORTANTE: Execute esta linha e veja se dá erro
INSERT INTO odontograms (patient_id)
VALUES (1)
RETURNING *;

-- Se der erro aqui, copie a mensagem de erro completa

-- 4. Se funcionou, verificar se os dentes foram criados automaticamente
SELECT COUNT(*) as total_dentes
FROM tooth_records
WHERE odontogram_id = (SELECT id FROM odontograms ORDER BY created_at DESC LIMIT 1);

-- Deve retornar 32 dentes

-- 5. Verificar se o trigger está funcionando
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'trigger_auto_initialize_teeth';

-- 6. Se o trigger não existir ou estiver desabilitado, recrie:
-- DROP TRIGGER IF EXISTS trigger_auto_initialize_teeth ON odontograms;
-- 
-- CREATE TRIGGER trigger_auto_initialize_teeth
--   AFTER INSERT ON odontograms
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_initialize_teeth();

-- 7. Limpar dados de teste (opcional)
-- DELETE FROM odontograms WHERE patient_id = 1;
