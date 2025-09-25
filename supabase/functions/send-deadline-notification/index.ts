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

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Send email to all company users using Resend HTTP API
    const emailPromises = users.map(user => 
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: "ESG Assessment <onboarding@resend.dev>",
          to: [user.email],
          subject: `ESG Assessment Deadline Update - ${company.name}`,
          html: `
            <h1>ESG Assessment Deadline Update</h1>
            <p>Dear Team,</p>
            <p>This is to inform you that the ESG assessment deadline for <strong>${company.name}</strong> has been updated.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2563eb; margin: 0;">New Deadline: ${deadlineDate}</h2>
            </div>
            <p>Please ensure that your ESG assessment submission is completed by this date.</p>
            <p>If you have any questions or need assistance, please don't hesitate to reach out.</p>
            <p>Best regards,<br>ESG Assessment Team</p>
          `,
        }),
      })
    );

    const results = await Promise.all(emailPromises);
    
    console.log('Email notification results:', results.map(r => r.status));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Deadline notifications sent to ${users.length} users`,
        emailsSent: results.length
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