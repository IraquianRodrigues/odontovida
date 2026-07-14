-- Módulo financeiro: lançamentos avulsos de receitas e despesas.
-- Migration não destrutiva e alinhada ao schema real do OdontoVida.

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'receita'
    CHECK (type IN ('receita', 'despesa')),
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL
    CHECK (amount > 0),
  payment_method TEXT
    CHECK (
      payment_method IS NULL OR payment_method IN (
        'dinheiro',
        'cartao_credito',
        'cartao_debito',
        'pix',
        'boleto',
        'transferencia'
      )
    ),
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'pago', 'cancelado', 'atrasado')),
  due_date DATE NOT NULL,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS transactions_client_id_idx
  ON public.transactions(client_id);

CREATE INDEX IF NOT EXISTS transactions_appointment_id_idx
  ON public.transactions(appointment_id);

CREATE INDEX IF NOT EXISTS transactions_due_date_idx
  ON public.transactions(due_date DESC);

CREATE INDEX IF NOT EXISTS transactions_type_status_idx
  ON public.transactions(type, status);

CREATE OR REPLACE FUNCTION public.set_transactions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;

CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_transactions_updated_at();

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'transactions'
      AND policyname = 'Authenticated users can read transactions'
  ) THEN
    CREATE POLICY "Authenticated users can read transactions"
      ON public.transactions
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'transactions'
      AND policyname = 'Authenticated users can create transactions'
  ) THEN
    CREATE POLICY "Authenticated users can create transactions"
      ON public.transactions
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'transactions'
      AND policyname = 'Authenticated users can update transactions'
  ) THEN
    CREATE POLICY "Authenticated users can update transactions"
      ON public.transactions
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'transactions'
      AND policyname = 'Authenticated users can delete transactions'
  ) THEN
    CREATE POLICY "Authenticated users can delete transactions"
      ON public.transactions
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END;
$$;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.transactions
  TO authenticated;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;
END;
$$;
