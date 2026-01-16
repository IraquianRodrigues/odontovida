-- =====================================================
-- ODONTOGRAM SCHEMA MIGRATION
-- =====================================================
-- Description: Creates tables and policies for digital odontogram system
-- Author: OdontoVida System
-- Date: 2026-01-15
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: odontograms
-- Description: Main odontogram table (one per patient)
-- =====================================================
CREATE TABLE IF NOT EXISTS odontograms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id)
);

-- =====================================================
-- TABLE: tooth_records
-- Description: Individual tooth records with status
-- =====================================================
CREATE TABLE IF NOT EXISTS tooth_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  odontogram_id UUID NOT NULL REFERENCES odontograms(id) ON DELETE CASCADE,
  tooth_number INTEGER NOT NULL, -- FDI notation (11-48 permanent, 51-85 deciduous)
  tooth_type VARCHAR(20) NOT NULL DEFAULT 'permanent', -- 'permanent' or 'deciduous'
  status VARCHAR(50) NOT NULL DEFAULT 'healthy', -- 'healthy', 'cavity', 'filled', 'missing', 'root_canal', 'crown', 'implant', etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_tooth_number CHECK (
    (tooth_number BETWEEN 11 AND 48) OR 
    (tooth_number BETWEEN 51 AND 85)
  ),
  CONSTRAINT valid_tooth_type CHECK (tooth_type IN ('permanent', 'deciduous')),
  UNIQUE(odontogram_id, tooth_number)
);

-- =====================================================
-- TABLE: tooth_surface_conditions
-- Description: Conditions on specific tooth surfaces
-- =====================================================
CREATE TABLE IF NOT EXISTS tooth_surface_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tooth_record_id UUID NOT NULL REFERENCES tooth_records(id) ON DELETE CASCADE,
  surface VARCHAR(20) NOT NULL, -- 'occlusal', 'mesial', 'distal', 'buccal', 'lingual', 'palatal'
  condition VARCHAR(50) NOT NULL, -- 'cavity', 'filling', 'fracture', 'wear', 'stain', etc.
  material VARCHAR(50), -- For restorations: 'amalgam', 'composite', 'ceramic', 'gold', etc.
  severity VARCHAR(20), -- 'mild', 'moderate', 'severe'
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_surface CHECK (surface IN ('occlusal', 'mesial', 'distal', 'buccal', 'lingual', 'palatal'))
);

-- =====================================================
-- TABLE: tooth_treatment_history
-- Description: History of treatments performed on teeth
-- =====================================================
CREATE TABLE IF NOT EXISTS tooth_treatment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tooth_record_id UUID NOT NULL REFERENCES tooth_records(id) ON DELETE CASCADE,
  treatment_type VARCHAR(100) NOT NULL, -- 'extraction', 'filling', 'root_canal', 'crown', 'cleaning', etc.
  description TEXT,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cost DECIMAL(10, 2),
  notes TEXT
);

-- =====================================================
-- INDEXES for performance optimization
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_odontograms_patient ON odontograms(patient_id);
CREATE INDEX IF NOT EXISTS idx_odontograms_created_by ON odontograms(created_by);
CREATE INDEX IF NOT EXISTS idx_tooth_records_odontogram ON tooth_records(odontogram_id);
CREATE INDEX IF NOT EXISTS idx_tooth_records_number ON tooth_records(tooth_number);
CREATE INDEX IF NOT EXISTS idx_tooth_surface_conditions_tooth ON tooth_surface_conditions(tooth_record_id);
CREATE INDEX IF NOT EXISTS idx_tooth_treatment_history_tooth ON tooth_treatment_history(tooth_record_id);
CREATE INDEX IF NOT EXISTS idx_tooth_treatment_history_performed_by ON tooth_treatment_history(performed_by);

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_odontograms_updated_at
  BEFORE UPDATE ON odontograms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tooth_records_updated_at
  BEFORE UPDATE ON tooth_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE odontograms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooth_surface_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooth_treatment_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ODONTOGRAMS POLICIES
-- =====================================================

-- Dentists can view all odontograms
CREATE POLICY "Dentists can view odontograms" ON odontograms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'dentista'
    )
  );

-- Dentists can insert odontograms
CREATE POLICY "Dentists can insert odontograms" ON odontograms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'dentista'
    )
  );

-- Dentists can update odontograms
CREATE POLICY "Dentists can update odontograms" ON odontograms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'dentista'
    )
  );

-- Dentists can delete odontograms
CREATE POLICY "Dentists can delete odontograms" ON odontograms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'dentista'
    )
  );

-- =====================================================
-- TOOTH RECORDS POLICIES
-- =====================================================

CREATE POLICY "Dentists can manage tooth records" ON tooth_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'dentista'
    )
  );

-- =====================================================
-- TOOTH SURFACE CONDITIONS POLICIES
-- =====================================================

CREATE POLICY "Dentists can manage surface conditions" ON tooth_surface_conditions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'dentista'
    )
  );

-- =====================================================
-- TOOTH TREATMENT HISTORY POLICIES
-- =====================================================

CREATE POLICY "Dentists can manage treatment history" ON tooth_treatment_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'dentista'
    )
  );

-- =====================================================
-- HELPER FUNCTION: Initialize default teeth for odontogram
-- =====================================================
CREATE OR REPLACE FUNCTION initialize_default_teeth(p_odontogram_id UUID)
RETURNS VOID AS $$
DECLARE
  tooth_num INTEGER;
BEGIN
  -- Insert permanent teeth (11-48)
  FOR tooth_num IN 11..18 LOOP
    INSERT INTO tooth_records (odontogram_id, tooth_number, tooth_type, status)
    VALUES (p_odontogram_id, tooth_num, 'permanent', 'healthy')
    ON CONFLICT (odontogram_id, tooth_number) DO NOTHING;
  END LOOP;
  
  FOR tooth_num IN 21..28 LOOP
    INSERT INTO tooth_records (odontogram_id, tooth_number, tooth_type, status)
    VALUES (p_odontogram_id, tooth_num, 'permanent', 'healthy')
    ON CONFLICT (odontogram_id, tooth_number) DO NOTHING;
  END LOOP;
  
  FOR tooth_num IN 31..38 LOOP
    INSERT INTO tooth_records (odontogram_id, tooth_number, tooth_type, status)
    VALUES (p_odontogram_id, tooth_num, 'permanent', 'healthy')
    ON CONFLICT (odontogram_id, tooth_number) DO NOTHING;
  END LOOP;
  
  FOR tooth_num IN 41..48 LOOP
    INSERT INTO tooth_records (odontogram_id, tooth_number, tooth_type, status)
    VALUES (p_odontogram_id, tooth_num, 'permanent', 'healthy')
    ON CONFLICT (odontogram_id, tooth_number) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-initialize teeth when odontogram is created
-- =====================================================
CREATE OR REPLACE FUNCTION auto_initialize_teeth()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_default_teeth(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_initialize_teeth
  AFTER INSERT ON odontograms
  FOR EACH ROW
  EXECUTE FUNCTION auto_initialize_teeth();

-- =====================================================
-- COMMENTS for documentation
-- =====================================================
COMMENT ON TABLE odontograms IS 'Main odontogram table - one per patient';
COMMENT ON TABLE tooth_records IS 'Individual tooth records using FDI notation';
COMMENT ON TABLE tooth_surface_conditions IS 'Conditions on specific tooth surfaces';
COMMENT ON TABLE tooth_treatment_history IS 'Historical record of treatments performed';
COMMENT ON COLUMN tooth_records.tooth_number IS 'FDI notation: 11-48 (permanent), 51-85 (deciduous)';
COMMENT ON COLUMN tooth_surface_conditions.surface IS 'Tooth surface: occlusal, mesial, distal, buccal, lingual, palatal';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
