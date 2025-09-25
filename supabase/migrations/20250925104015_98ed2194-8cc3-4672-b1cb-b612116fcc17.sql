-- Fix RLS policies for submissions table
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Client can see their company submissions" ON public.submissions;
DROP POLICY IF EXISTS "Client can update draft submissions" ON public.submissions;

-- Create new working policies for submissions
CREATE POLICY "Users can view their company submissions" 
ON public.submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.email = auth.email() 
    AND users.company_id = submissions.company_id
  )
);

CREATE POLICY "Users can insert submissions for their company" 
ON public.submissions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.email = auth.email() 
    AND users.company_id = submissions.company_id
  )
);

CREATE POLICY "Users can update draft submissions for their company" 
ON public.submissions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.email = auth.email() 
    AND users.company_id = submissions.company_id
  ) AND status = 'draft'
);

-- Also check responses table policies
DROP POLICY IF EXISTS "Client can insert draft responses" ON public.responses;
DROP POLICY IF EXISTS "Client can update draft responses" ON public.responses;

-- Create proper policies for responses table
CREATE POLICY "Users can view their company responses" 
ON public.responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.submissions s 
    JOIN public.users u ON u.company_id = s.company_id
    WHERE s.id = responses.submission_id 
    AND u.email = auth.email()
  )
);

CREATE POLICY "Users can insert draft responses" 
ON public.responses 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.submissions s 
    JOIN public.users u ON u.company_id = s.company_id
    WHERE s.id = responses.submission_id 
    AND u.email = auth.email() 
    AND s.status = 'draft'
  )
);

CREATE POLICY "Users can update draft responses" 
ON public.responses 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.submissions s 
    JOIN public.users u ON u.company_id = s.company_id
    WHERE s.id = responses.submission_id 
    AND u.email = auth.email() 
    AND s.status = 'draft'
  )
);