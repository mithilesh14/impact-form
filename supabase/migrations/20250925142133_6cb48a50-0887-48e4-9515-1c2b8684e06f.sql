-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION generate_question_code(section_name TEXT)
RETURNS TEXT AS $$
DECLARE
    section_code TEXT;
    next_number INTEGER;
    new_code TEXT;
BEGIN
    -- Create section code from first 3 letters of section, uppercase
    section_code := UPPER(LEFT(section_name, 3));
    
    -- Find the next available number for this section
    SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM questions 
    WHERE code ~ ('^' || section_code || '[0-9]+$');
    
    -- Generate the new code
    new_code := section_code || LPAD(next_number::TEXT, 3, '0');
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

CREATE OR REPLACE FUNCTION auto_generate_question_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := generate_question_code(NEW.section);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;