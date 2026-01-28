-- Create professional_schedules table
CREATE TABLE IF NOT EXISTS professional_schedules (
  id SERIAL PRIMARY KEY,
  professional_id INTEGER NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_available BOOLEAN DEFAULT true,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id, day_of_week)
);

-- Create index for faster queries
CREATE INDEX idx_professional_schedules_professional_id ON professional_schedules(professional_id);
CREATE INDEX idx_professional_schedules_day_of_week ON professional_schedules(day_of_week);

-- Add RLS policies
ALTER TABLE professional_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read professional schedules"
  ON professional_schedules
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage professional schedules"
  ON professional_schedules
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_professional_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER professional_schedules_updated_at
  BEFORE UPDATE ON professional_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_schedules_updated_at();

-- Insert default schedules for existing professionals (Mon-Fri 9:00-18:00)
INSERT INTO professional_schedules (professional_id, day_of_week, is_available, start_time, end_time)
SELECT 
  p.id,
  d.day,
  CASE WHEN d.day BETWEEN 1 AND 5 THEN true ELSE false END, -- Mon-Fri available
  '09:00'::TIME,
  '18:00'::TIME
FROM professionals p
CROSS JOIN (
  SELECT generate_series(0, 6) AS day
) d
ON CONFLICT (professional_id, day_of_week) DO NOTHING;
