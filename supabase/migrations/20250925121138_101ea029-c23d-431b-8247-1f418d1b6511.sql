-- Create security definer function to get current user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE email = auth.email();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Fix the users RLS policy to avoid recursion
DROP POLICY IF EXISTS "Users can read their row or admins can read all" ON public.users;
CREATE POLICY "Users can read their row or admins can read all" ON public.users
FOR SELECT USING (
  auth.email() = email OR 
  public.get_current_user_role() = 'Admin'
);