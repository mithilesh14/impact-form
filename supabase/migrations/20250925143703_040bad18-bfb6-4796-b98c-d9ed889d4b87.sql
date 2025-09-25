-- Create a security definer function to safely access submission history data
CREATE OR REPLACE FUNCTION public.get_submission_with_history(target_company_id UUID DEFAULT NULL)
RETURNS TABLE (
    section text,
    question_id uuid,
    current_submission_id uuid,
    company_id uuid,
    reporting_year integer,
    last_year integer,
    last_year_value text,
    current_value text,
    question_code text,
    question_text text,
    input_type text
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Check if user has permission (same logic as other RLS policies)
  WITH user_check AS (
    SELECT u.company_id as user_company_id, u.role as user_role
    FROM users u 
    WHERE u.email = auth.email()
  )
  SELECT 
    swh.section,
    swh.question_id,
    swh.current_submission_id,
    swh.company_id,
    swh.reporting_year,
    swh.last_year,
    swh.last_year_value,
    swh.current_value,
    swh.question_code,
    swh.question_text,
    swh.input_type
  FROM submission_with_history swh
  CROSS JOIN user_check uc
  WHERE (
    -- User can see their own company's data OR user is admin OR specific company requested by admin
    uc.user_company_id = swh.company_id 
    OR uc.user_role = 'Admin'
  )
  AND (
    -- If target_company_id is specified, filter to that company (for admin use)
    target_company_id IS NULL 
    OR swh.company_id = target_company_id
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_submission_with_history(UUID) TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION public.get_submission_with_history(UUID) IS 'Securely retrieve submission history data with proper access controls. Users can only see their company data, admins can see all or filter by company_id.';