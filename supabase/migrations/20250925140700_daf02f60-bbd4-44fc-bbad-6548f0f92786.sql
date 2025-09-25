-- Allow admins to manage companies
CREATE POLICY "Admins can insert companies" 
ON public.companies 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
);

CREATE POLICY "Admins can update companies" 
ON public.companies 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
);

CREATE POLICY "Admins can delete companies" 
ON public.companies 
FOR DELETE 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
);

-- Allow admins to manage questions
CREATE POLICY "Admins can insert questions" 
ON public.questions 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
);

CREATE POLICY "Admins can update questions" 
ON public.questions 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
);

CREATE POLICY "Admins can delete questions" 
ON public.questions 
FOR DELETE 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
);

-- Allow admins to manage users
CREATE POLICY "Admins can insert users" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
);

CREATE POLICY "Admins can update users" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
);

CREATE POLICY "Admins can delete users" 
ON public.users 
FOR DELETE 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Admin')
);

-- Add review status to responses table for reviewer functionality
ALTER TABLE public.responses 
ADD COLUMN review_status TEXT DEFAULT 'pending';

ALTER TABLE public.responses 
ADD COLUMN reviewed_by UUID REFERENCES users(id);

ALTER TABLE public.responses 
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;

-- Allow reviewers to update review status
CREATE POLICY "Reviewers can update review status" 
ON public.responses 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND role = 'Reviewer')
);