import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SurveyData {
  fullName: string;
  email: string;
  phone: string;
  businessType: string;
  employeeCount: string;
  location: string;
  currentMethod: string;
  challenges: string[];
  challengesOther: string;
  biggestPain: string;
  interestedFeatures: string[];
  featuresOther: string;
  budgetRange: string;
  launchInterest: string;
  additionalComments: string;
}

// HTML-escape user input to prevent XSS
function escapeHtml(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendEmail(to: string[], subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "OptimalStock Pro <info@optimalstockpro.com>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { surveyData }: { surveyData: SurveyData } = await req.json();

    // Sanitize all user inputs
    const safe = {
      fullName: escapeHtml(surveyData.fullName) || "Not provided",
      email: escapeHtml(surveyData.email),
      phone: escapeHtml(surveyData.phone) || "Not provided",
      businessType: escapeHtml(surveyData.businessType),
      employeeCount: escapeHtml(surveyData.employeeCount),
      location: escapeHtml(surveyData.location),
      currentMethod: escapeHtml(surveyData.currentMethod) || "Not specified",
      challenges: surveyData.challenges?.map(escapeHtml).join(", ") || "None selected",
      challengesOther: escapeHtml(surveyData.challengesOther),
      biggestPain: escapeHtml(surveyData.biggestPain) || "Not specified",
      interestedFeatures: surveyData.interestedFeatures?.map(escapeHtml).join(", ") || "None selected",
      featuresOther: escapeHtml(surveyData.featuresOther),
      budgetRange: escapeHtml(surveyData.budgetRange) || "Not specified",
      launchInterest: escapeHtml(surveyData.launchInterest) || "Not specified",
      additionalComments: escapeHtml(surveyData.additionalComments),
    };

    const adminEmailHtml = `
      <h1>New Survey Response</h1>
      <h2>Contact Information</h2>
      <ul>
        <li><strong>Name:</strong> ${safe.fullName}</li>
        <li><strong>Email:</strong> ${safe.email}</li>
        <li><strong>Phone:</strong> ${safe.phone}</li>
      </ul>
      
      <h2>Business Information</h2>
      <ul>
        <li><strong>Business Type:</strong> ${safe.businessType}</li>
        <li><strong>Employees:</strong> ${safe.employeeCount}</li>
        <li><strong>Location:</strong> ${safe.location}</li>
      </ul>
      
      <h2>Inventory Management</h2>
      <ul>
        <li><strong>Current Method:</strong> ${safe.currentMethod}</li>
        <li><strong>Challenges:</strong> ${safe.challenges}${safe.challengesOther ? ` (Other: ${safe.challengesOther})` : ""}</li>
        <li><strong>Biggest Pain Point:</strong> ${safe.biggestPain}</li>
      </ul>
      
      <h2>Features & Budget</h2>
      <ul>
        <li><strong>Interested Features:</strong> ${safe.interestedFeatures}${safe.featuresOther ? ` (Other: ${safe.featuresOther})` : ""}</li>
        <li><strong>Budget Range:</strong> ${safe.budgetRange}</li>
        <li><strong>Launch Interest:</strong> ${safe.launchInterest}</li>
      </ul>
      
      ${safe.additionalComments ? `<h2>Additional Comments</h2><p>${safe.additionalComments}</p>` : ""}
    `;

    const adminEmailResponse = await sendEmail(
      ["info@optimalstockpro.com"],
      `New Survey Response from ${safe.fullName !== "Not provided" ? safe.fullName : safe.email}`,
      adminEmailHtml
    );

    console.log("Admin email sent:", adminEmailResponse);

    const firstName = safe.fullName !== "Not provided" ? safe.fullName.split(" ")[0] : "Valued Customer";

    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #16a34a; font-size: 22px;">Thank you for completing the survey — here is your exclusive reward.</h1>
        
        <p style="font-size: 15px; line-height: 1.6;">Dear ${firstName},</p>
        
        <p style="font-size: 15px; line-height: 1.6;">Thank you for taking the time to complete our survey. We truly appreciate your input — responses like yours are what will help us build an inventory solution that works for Nigerian SMEs in the real world.</p>
        
        <p style="font-size: 15px; line-height: 1.6;">As promised, here is your exclusive code for <strong>1 month free access</strong> when OptimalStockPro launches:</p>
        
        <div style="background: #f0fdf4; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
          <p style="font-size: 14px; color: #166534; margin: 0 0 8px 0;">🌟 Your Free Access Code</p>
          <p style="font-size: 28px; font-weight: bold; color: #16a34a; letter-spacing: 4px; margin: 0;">SURVEYFREE1</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">Please save this email so you have the code ready when you sign up. We will notify you as soon as we go live.</p>
        
        <p style="font-size: 15px; line-height: 1.6;">In the meantime, feel free to explore our platform and see what we are building:</p>
        
        <p style="font-size: 15px; line-height: 1.6;">🌐 <a href="https://optimalstockpro-ng.lovable.app" style="color: #16a34a; text-decoration: underline;">optimalstockpro.com</a></p>
        
        <p style="font-size: 15px; line-height: 1.6;">If you have any additional thoughts or questions, do not hesitate to reach out — we read every message.</p>
        
        <p style="font-size: 15px; line-height: 1.6;">We look forward to supporting your business.</p>
        
        <p style="font-size: 15px; line-height: 1.6; margin-top: 32px;">
          Kind regards,<br><br>
          <strong>Arinola Abolarin</strong><br><br>
          📧 <a href="mailto:info@optimalstockpro.com" style="color: #16a34a;">info@optimalstockpro.com</a><br>
          🌐 <a href="https://optimalstockpro-ng.lovable.app" style="color: #16a34a;">optimalstockpro.com</a>
        </p>
      </div>
    `;

    const userEmailResponse = await sendEmail(
      [surveyData.email],
      "Thank you for completing the survey — here is your 1 month free access",
      userEmailHtml
    );

    console.log("User email sent:", userEmailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-survey-notification function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notification. Please try again later." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
