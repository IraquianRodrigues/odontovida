-- =====================================================
-- ADD USER_ID TO PROFESSIONALS TABLE
-- =====================================================
-- This migration adds user_id column to link professionals with user accounts

-- Add user_id column to professionals table
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);

-- Add unique constraint to ensure one professional per user
ALTER TABLE professionals
ADD CONSTRAINT unique_professional_user_id UNIQUE (user_id);

-- Add comment
COMMENT ON COLUMN professionals.user_id IS 'Links professional to a user account (for dentists who can login)';

-- Verify the column was added
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'professionals'
  AND column_name = 'user_id';

-- Show current professionals
SELECT 
  id,
  code,
  name,
  specialty,
  user_id,
  created_at
FROM professionals
ORDER BY name;
