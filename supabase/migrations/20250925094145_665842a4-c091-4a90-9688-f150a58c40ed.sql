-- Drop and recreate the view with SECURITY INVOKER
DROP VIEW IF EXISTS public.submission_with_history;

CREATE VIEW public.submission_with_history 
WITH (security_invoker = true) AS
SELECT q.id AS question_id,
    q.code AS question_code,
    q.section,
    q.question_text,
    q.input_type,
    curr.id AS current_submission_id,
    curr.company_id,
    curr.reporting_year,
    r_curr.value_text AS current_value,
    prev.reporting_year AS last_year,
    r_prev.value_text AS last_year_value
   FROM ((((questions q
     CROSS JOIN submissions curr)
     LEFT JOIN responses r_curr ON (((r_curr.submission_id = curr.id) AND (r_curr.question_id = q.id))))
     LEFT JOIN submissions prev ON (((prev.company_id = curr.company_id) AND (prev.reporting_year = (curr.reporting_year - 1)) AND (prev.status = 'approved'::text))))
     LEFT JOIN responses r_prev ON (((r_prev.submission_id = prev.id) AND (r_prev.question_id = q.id))));