-- Add ziyaadaz back to users table as Submitter with correct company_id
INSERT INTO public.users (email, role, company_id) 
VALUES ('ziyaadaz@gmail.com', 'Submitter', 'fdcb571a-a3d2-4f8f-adbf-d872606f2856')
ON CONFLICT (email) DO UPDATE SET 
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id;