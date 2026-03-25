DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'services'
      AND column_name = 'description'
  ) THEN
    ALTER TABLE public.services
    ADD COLUMN description TEXT;
  END IF;
END
$$;

COMMENT ON COLUMN public.services.description IS 'Descrição opcional do serviço para uso operacional, IA e integrações n8n';
