-- Treatment Plans: Plano de tratamento odontológico
CREATE TABLE IF NOT EXISTS treatment_plans (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  professional_id INTEGER NOT NULL REFERENCES professionals(id),
  title TEXT NOT NULL DEFAULT 'Plano de Tratamento',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Treatment Plan Items: Procedimentos individuais do plano
CREATE TABLE IF NOT EXISTS treatment_plan_items (
  id SERIAL PRIMARY KEY,
  treatment_plan_id INTEGER NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
  tooth_number INTEGER, -- nullable: pode ser procedimento geral
  procedure_name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_treatment_plans_client ON treatment_plans(client_id);
CREATE INDEX idx_treatment_plans_professional ON treatment_plans(professional_id);
CREATE INDEX idx_treatment_plan_items_plan ON treatment_plan_items(treatment_plan_id);

-- RLS
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage treatment_plans"
  ON treatment_plans FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage treatment_plan_items"
  ON treatment_plan_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
