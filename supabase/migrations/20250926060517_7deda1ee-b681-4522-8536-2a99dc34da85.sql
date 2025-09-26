-- Create storage bucket for file attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);

-- Create attachments table to track uploaded files
CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID REFERENCES public.responses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on attachments table
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for attachments
CREATE POLICY "Users can view attachments for their company responses" 
ON public.attachments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM responses r
    JOIN submissions s ON s.id = r.submission_id
    JOIN users u ON (u.company_id = s.company_id OR u.role = 'Admin' OR u.role = 'Reviewer')
    WHERE r.id = attachments.response_id 
    AND u.email = auth.email()
  )
);

CREATE POLICY "Users can insert attachments for their company responses" 
ON public.attachments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM responses r
    JOIN submissions s ON s.id = r.submission_id
    JOIN users u ON (u.company_id = s.company_id OR u.role = 'Admin')
    WHERE r.id = attachments.response_id 
    AND u.email = auth.email()
    AND (s.status = 'draft' OR u.role = 'Admin')
  )
);

CREATE POLICY "Users can delete their attachments" 
ON public.attachments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM responses r
    JOIN submissions s ON s.id = r.submission_id
    JOIN users u ON (u.company_id = s.company_id OR u.role = 'Admin')
    WHERE r.id = attachments.response_id 
    AND u.email = auth.email()
    AND (s.status = 'draft' OR u.role = 'Admin')
  )
);

-- Create storage policies for attachments bucket
CREATE POLICY "Users can view attachments for their company"
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'attachments' 
  AND EXISTS (
    SELECT 1 
    FROM attachments a
    JOIN responses r ON r.id = a.response_id
    JOIN submissions s ON s.id = r.submission_id
    JOIN users u ON (u.company_id = s.company_id OR u.role = 'Admin' OR u.role = 'Reviewer')
    WHERE a.file_path = name 
    AND u.email = auth.email()
  )
);

CREATE POLICY "Users can upload attachments for their company"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'attachments'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their attachments"
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'attachments' 
  AND EXISTS (
    SELECT 1 
    FROM attachments a
    JOIN responses r ON r.id = a.response_id
    JOIN submissions s ON s.id = r.submission_id
    JOIN users u ON (u.company_id = s.company_id OR u.role = 'Admin')
    WHERE a.file_path = name 
    AND u.email = auth.email()
    AND (s.status = 'draft' OR u.role = 'Admin')
  )
);

CREATE POLICY "Users can delete their attachments"
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'attachments' 
  AND EXISTS (
    SELECT 1 
    FROM attachments a
    JOIN responses r ON r.id = a.response_id
    JOIN submissions s ON s.id = r.submission_id
    JOIN users u ON (u.company_id = s.company_id OR u.role = 'Admin')
    WHERE a.file_path = name 
    AND u.email = auth.email()
    AND (s.status = 'draft' OR u.role = 'Admin')
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_attachment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attachments_updated_at
BEFORE UPDATE ON public.attachments
FOR EACH ROW
EXECUTE FUNCTION public.update_attachment_updated_at();