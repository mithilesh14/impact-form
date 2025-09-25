-- Step 1: Drop the existing constraint completely
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Update all existing 'client' users to 'Submitter' 
UPDATE public.users 
SET role = 'Submitter' 
WHERE role = 'client';

-- Step 3: Now add the new constraint that allows Admin, Reviewer, Submitter
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('Admin', 'Reviewer', 'Submitter'));