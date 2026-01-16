-- =====================================================
-- ADD ADMIN ACCESS TO ODONTOGRAM
-- =====================================================
-- Purpose: Grant admin role full access to odontogram features
-- Date: 2026-01-15
-- =====================================================

-- Drop existing policies (both old and new names)
DROP POLICY IF EXISTS "Dentists can view odontograms" ON odontograms;
DROP POLICY IF EXISTS "Dentists and Admins can view odontograms" ON odontograms;
DROP POLICY IF EXISTS "Dentists can insert odontograms" ON odontograms;
DROP POLICY IF EXISTS "Dentists and Admins can insert odontograms" ON odontograms;
DROP POLICY IF EXISTS "Dentists can update odontograms" ON odontograms;
DROP POLICY IF EXISTS "Dentists and Admins can update odontograms" ON odontograms;
DROP POLICY IF EXISTS "Dentists can delete odontograms" ON odontograms;
DROP POLICY IF EXISTS "Dentists and Admins can delete odontograms" ON odontograms;
DROP POLICY IF EXISTS "Dentists can manage tooth records" ON tooth_records;
DROP POLICY IF EXISTS "Dentists and Admins can manage tooth records" ON tooth_records;
DROP POLICY IF EXISTS "Dentists can manage surface conditions" ON tooth_surface_conditions;
DROP POLICY IF EXISTS "Dentists and Admins can manage surface conditions" ON tooth_surface_conditions;
DROP POLICY IF EXISTS "Dentists can manage treatment history" ON tooth_treatment_history;
DROP POLICY IF EXISTS "Dentists and Admins can manage treatment history" ON tooth_treatment_history;

-- =====================================================
-- ODONTOGRAMS POLICIES (Dentists + Admins)
-- =====================================================

-- Dentists and Admins can view all odontograms
CREATE POLICY "Dentists and Admins can view odontograms" ON odontograms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('dentista', 'admin')
    )
  );

-- Dentists and Admins can insert odontograms
CREATE POLICY "Dentists and Admins can insert odontograms" ON odontograms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('dentista', 'admin')
    )
  );

-- Dentists and Admins can update odontograms
CREATE POLICY "Dentists and Admins can update odontograms" ON odontograms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('dentista', 'admin')
    )
  );

-- Dentists and Admins can delete odontograms
CREATE POLICY "Dentists and Admins can delete odontograms" ON odontograms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('dentista', 'admin')
    )
  );

-- =====================================================
-- TOOTH RECORDS POLICIES (Dentists + Admins)
-- =====================================================

CREATE POLICY "Dentists and Admins can manage tooth records" ON tooth_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('dentista', 'admin')
    )
  );

-- =====================================================
-- TOOTH SURFACE CONDITIONS POLICIES (Dentists + Admins)
-- =====================================================

CREATE POLICY "Dentists and Admins can manage surface conditions" ON tooth_surface_conditions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('dentista', 'admin')
    )
  );

-- =====================================================
-- TOOTH TREATMENT HISTORY POLICIES (Dentists + Admins)
-- =====================================================

CREATE POLICY "Dentists and Admins can manage treatment history" ON tooth_treatment_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('dentista', 'admin')
    )
  );

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('odontograms', 'tooth_records', 'tooth_surface_conditions', 'tooth_treatment_history')
ORDER BY tablename, policyname;
