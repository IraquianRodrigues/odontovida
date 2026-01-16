-- =====================================================
-- DIAGNOSTIC SCRIPT: Odontogram Patient List Issue (FIXED)
-- =====================================================
-- Purpose: Investigate why patients are not appearing in odontogram
-- Issue: Patient scheduled for Dr. Luciano not showing in patient list
-- =====================================================

-- 1. Check if Dr. Luciano exists in user_profiles as 'dentista'
SELECT 
  'User Profiles - Dentistas' as check_name,
  up.id as user_id,
  up.email,
  up.role,
  up.full_name
FROM user_profiles up
WHERE up.role = 'dentista'
ORDER BY up.email;

-- 2. Check if Dr. Luciano has a professional record
SELECT 
  'Professionals Table' as check_name,
  p.id as professional_id,
  p.code,
  p.name,
  p.user_id,
  p.specialty,
  up.email as user_email,
  up.role as user_role
FROM professionals p
LEFT JOIN user_profiles up ON p.user_id = up.id
WHERE p.name ILIKE '%luciano%' OR up.email ILIKE '%luciano%'
ORDER BY p.name;

-- 3. Check all appointments for professionals
SELECT 
  'Appointments by Professional' as check_name,
  p.name as professional_name,
  p.id as professional_id,
  p.code as professional_code,
  COUNT(a.id) as appointment_count,
  COUNT(DISTINCT a.customer_name) as unique_patients
FROM professionals p
LEFT JOIN appointments a ON (
  CASE 
    WHEN p.code ~ '^[0-9]+$' THEN a.professional_code = CAST(p.code AS INTEGER)
    ELSE FALSE
  END
)
GROUP BY p.id, p.name, p.code
ORDER BY p.name;

-- 4. Check specific appointments for Dr. Luciano (if exists)
SELECT 
  'Dr. Luciano Appointments' as check_name,
  a.id as appointment_id,
  a.customer_name,
  a.customer_phone,
  a.professional_code,
  p.code as professional_code_in_table,
  p.name as professional_name,
  a.start_time,
  a.status
FROM appointments a
LEFT JOIN professionals p ON (
  CASE 
    WHEN p.code ~ '^[0-9]+$' THEN a.professional_code = CAST(p.code AS INTEGER)
    ELSE FALSE
  END
)
WHERE p.name ILIKE '%luciano%' OR (
  a.professional_code IN (
    SELECT CAST(code AS INTEGER) 
    FROM professionals 
    WHERE name ILIKE '%luciano%' AND code ~ '^[0-9]+$'
  )
)
ORDER BY a.start_time DESC
LIMIT 20;

-- 5. Check if there are appointments without professional_code
SELECT 
  'Appointments without Professional' as check_name,
  COUNT(*) as count
FROM appointments
WHERE professional_code IS NULL;

-- 6. Check recent appointments (last 30 days)
SELECT 
  'Recent Appointments' as check_name,
  a.id,
  a.customer_name,
  a.customer_phone,
  a.professional_code,
  p.code as professional_code_in_table,
  p.name as professional_name,
  a.start_time,
  a.status
FROM appointments a
LEFT JOIN professionals p ON (
  CASE 
    WHEN p.code ~ '^[0-9]+$' THEN a.professional_code = CAST(p.code AS INTEGER)
    ELSE FALSE
  END
)
WHERE a.start_time >= NOW() - INTERVAL '30 days'
ORDER BY a.start_time DESC
LIMIT 20;

-- 7. Check the relationship between users and professionals
SELECT 
  'User-Professional Mapping' as check_name,
  up.email,
  up.role,
  p.id as professional_id,
  p.name as professional_name,
  p.code
FROM user_profiles up
LEFT JOIN professionals p ON p.user_id = up.id
WHERE up.role IN ('dentista', 'medico')
ORDER BY up.email;

-- 8. Check if there are any patients in clientes table
SELECT 
  'Total Patients' as check_name,
  COUNT(*) as total_patients
FROM clientes;

-- 9. Check if customer_name from appointments matches clientes.nome
SELECT 
  'Appointments vs Clientes Match' as check_name,
  a.customer_name,
  c.nome as cliente_nome,
  c.id as cliente_id,
  CASE 
    WHEN c.id IS NOT NULL THEN 'MATCHED'
    ELSE 'NOT MATCHED'
  END as match_status
FROM appointments a
LEFT JOIN clientes c ON LOWER(TRIM(a.customer_name)) = LOWER(TRIM(c.nome))
WHERE a.start_time >= NOW() - INTERVAL '30 days'
ORDER BY a.start_time DESC
LIMIT 20;

-- =====================================================
-- RECOMMENDATIONS BASED ON RESULTS:
-- =====================================================
-- IMPORTANT: appointments table stores customer data directly
-- (customer_name, customer_phone) NOT as foreign keys to clientes
--
-- If Dr. Luciano exists in user_profiles but NOT in professionals:
--   -> Need to create a professional record for Dr. Luciano
--
-- If appointments exist but professional_code is NULL:
--   -> Need to update appointments with correct professional_code
--
-- If professional exists but appointments have wrong professional_code:
--   -> Need to update appointments to link to correct professional
--
-- If professional.code is TEXT but appointments.professional_code is INTEGER:
--   -> This is expected, the JOIN uses CAST(p.code AS INTEGER)
--
-- If customer_name doesn't match clientes.nome:
--   -> The odontogram page needs to match by name, not by ID
-- =====================================================
