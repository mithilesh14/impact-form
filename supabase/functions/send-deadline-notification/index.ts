import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  companyId: string;
  deadline: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { companyId, deadline }: NotificationRequest = await req.json();

    console.log('Sending deadline notification for company:', companyId, 'deadline:', deadline);

    // Get company and users info
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();

    if (companyError) {
      throw new Error(`Failed to fetch company: ${companyError.message}`);
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email')
      .eq('company_id', companyId);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      console.log('No users found for company:', companyId);
      return new Response(
        JSON.stringify({ message: 'No users found for this company' }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const deadlineDate = new Date(deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // For now, just log the email that would be sent (since Resend requires setup)
    console.log('Would send deadline notification to:', users.map(u => u.email));
    console.log('Company:', company.name);
    console.log('New deadline:', deadlineDate);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Deadline notification logged for ${users.length} users`,
        company: company.name,
        deadline: deadlineDate,
        users: users.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-deadline-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);