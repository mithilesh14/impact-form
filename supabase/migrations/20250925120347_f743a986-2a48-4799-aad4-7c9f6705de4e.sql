-- Update RLS policies to allow admin global access

-- Update companies policy to allow admins to view all companies
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
CREATE POLICY "Users can view their company or admins can view all" ON public.companies
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.email = auth.email() 
    AND (
      (users.company_id = companies.id) OR 
      (users.role = 'Admin')
    )
  )
);

-- Update submissions policy to allow admins to view all submissions
DROP POLICY IF EXISTS "Users can view their company submissions" ON public.submissions;
CREATE POLICY "Users can view their company submissions or admins can view all" ON public.submissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.email = auth.email() 
    AND (
      (users.company_id = submissions.company_id) OR 
      (users.role = 'Admin')
    )
  )
);

-- Update submissions update policy to allow admins to update any submission
DROP POLICY IF EXISTS "Users can update draft submissions for their company" ON public.submissions;
CREATE POLICY "Users can update draft submissions for their company or admins can update any" ON public.submissions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.email = auth.email() 
    AND (
      (users.company_id = submissions.company_id AND submissions.status = 'draft') OR 
      (users.role = 'Admin')
    )
  )
);

-- Update responses view policy to allow admins to view all responses
DROP POLICY IF EXISTS "Users can view their company responses" ON public.responses;
CREATE POLICY "Users can view their company responses or admins can view all" ON public.responses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM (submissions s JOIN users u ON (u.company_id = s.company_id OR u.role = 'Admin'))
    WHERE s.id = responses.submission_id AND u.email = auth.email()
  )
);

-- Update responses insert policy to allow admins to insert any response
DROP POLICY IF EXISTS "Users can insert draft responses" ON public.responses;
CREATE POLICY "Users can insert draft responses or admins can insert any" ON public.responses
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM (submissions s JOIN users u ON (u.company_id = s.company_id OR u.role = 'Admin'))
    WHERE s.id = responses.submission_id 
    AND u.email = auth.email() 
    AND (s.status = 'draft' OR u.role = 'Admin')
  )
);

-- Update responses update policy to allow admins to update any response
DROP POLICY IF EXISTS "Users can update draft responses" ON public.responses;
CREATE POLICY "Users can update draft responses or admins can update any" ON public.responses
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM (submissions s JOIN users u ON (u.company_id = s.company_id OR u.role = 'Admin'))
    WHERE s.id = responses.submission_id 
    AND u.email = auth.email() 
    AND (s.status = 'draft' OR u.role = 'Admin')
  )
);

-- Update users policy to allow admins to view all users
DROP POLICY IF EXISTS "Users can read their row" ON public.users;
CREATE POLICY "Users can read their row or admins can read all" ON public.users
FOR SELECT USING (
  auth.email() = email OR 
  EXISTS (
    SELECT 1 FROM users admin_user 
    WHERE admin_user.email = auth.email() 
    AND admin_user.role = 'Admin'
  )
);

-- Insert admin user
INSERT INTO public.users (email, role, company_id)
VALUES ('maukle@ascm.com', 'Admin', NULL)
ON CONFLICT (email) DO UPDATE SET role = 'Admin', company_id = NULL;