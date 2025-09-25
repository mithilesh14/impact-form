-- Enable RLS on tables that don't have it enabled (excluding views)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies table
-- Users can only see their own company data
CREATE POLICY "Users can view their company" 
ON public.companies 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.email = auth.email() 
    AND users.company_id = companies.id
  )
);

-- Create RLS policies for questions table  
-- All authenticated users can read questions (they're standard ESG questions)
CREATE POLICY "Authenticated users can view questions" 
ON public.questions 
FOR SELECT 
USING (auth.role() = 'authenticated');