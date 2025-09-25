-- Use 'client' role instead of 'submitter' based on existing constraint
-- 1. Truncate all tables (clears data but keeps structure)
TRUNCATE TABLE responses CASCADE;
TRUNCATE TABLE submissions CASCADE;
TRUNCATE TABLE questions CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE companies CASCADE;

-- 2. Insert companies with required code field
INSERT INTO companies (id, name, code) VALUES
  (gen_random_uuid(), 'Maukle Corp', 'MAUKLE'),
  (gen_random_uuid(), 'Ziyaad Holdings', 'ZIYAAD');

-- 3. Insert users (linked to companies) - using 'client' role
INSERT INTO users (id, email, role, company_id)
SELECT gen_random_uuid(), 'maukle14@gmail.com', 'client', c.id
FROM companies c WHERE c.name = 'Maukle Corp';

INSERT INTO users (id, email, role, company_id)
SELECT gen_random_uuid(), 'ziyaadaz@gmail.com', 'client', c.id
FROM companies c WHERE c.name = 'Ziyaad Holdings';

-- 4. Insert questions (3 general, 3 governance)
INSERT INTO questions (id, code, question_text, section, input_type) VALUES
  (gen_random_uuid(), 'Q0001', 'Country(ies) of operations', 'general', 'text'),
  (gen_random_uuid(), 'Q0002', 'Headquarter of the company', 'general', 'text'),
  (gen_random_uuid(), 'Q0003', 'Year of investment', 'general', 'number'),
  (gen_random_uuid(), 'Q0004', 'Number of board members', 'governance', 'number'),
  (gen_random_uuid(), 'Q0005', 'Is there an independent audit committee?', 'governance', 'text'),
  (gen_random_uuid(), 'Q0006', 'Frequency of board meetings per year', 'governance', 'number');

-- 5. Insert submissions for 2024
INSERT INTO submissions (id, company_id, reporting_year, status)
SELECT gen_random_uuid(), c.id, 2024, 'approved'
FROM companies c;

-- 6. Insert responses for 2024 
-- Maukle Corp
INSERT INTO responses (id, submission_id, question_id, value_text)
SELECT gen_random_uuid(), s.id, q.id, v.answer
FROM submissions s
JOIN companies c ON s.company_id = c.id
JOIN questions q ON q.code IN ('Q0001','Q0002','Q0003')
JOIN (VALUES
  ('Q0001','Mauritius'),
  ('Q0002','Port Louis HQ'),
  ('Q0003','2020')
) v(code, answer) ON v.code = q.code
WHERE c.name = 'Maukle Corp' AND s.reporting_year = 2024;

-- Ziyaad Holdings  
INSERT INTO responses (id, submission_id, question_id, value_text)
SELECT gen_random_uuid(), s.id, q.id, v.answer
FROM submissions s
JOIN companies c ON s.company_id = c.id
JOIN questions q ON q.code IN ('Q0001','Q0002','Q0003')
JOIN (VALUES
  ('Q0001','South Africa'),
  ('Q0002','Johannesburg HQ'),
  ('Q0003','2018')
) v(code, answer) ON v.code = q.code
WHERE c.name = 'Ziyaad Holdings' AND s.reporting_year = 2024;