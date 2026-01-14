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

async function sendEmail(to: string[], subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "OptimalStock Pro <onboarding@resend.dev>",
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { surveyData }: { surveyData: SurveyData } = await req.json();

    // Send notification email to admin
    const adminEmailHtml = `
      <h1>New Survey Response</h1>
      <h2>Contact Information</h2>
      <ul>
        <li><strong>Name:</strong> ${surveyData.fullName || "Not provided"}</li>
        <li><strong>Email:</strong> ${surveyData.email}</li>
        <li><strong>Phone:</strong> ${surveyData.phone || "Not provided"}</li>
      </ul>
      
      <h2>Business Information</h2>
      <ul>
        <li><strong>Business Type:</strong> ${surveyData.businessType}</li>
        <li><strong>Employees:</strong> ${surveyData.employeeCount}</li>
        <li><strong>Location:</strong> ${surveyData.location}</li>
      </ul>
      
      <h2>Inventory Management</h2>
      <ul>
        <li><strong>Current Method:</strong> ${surveyData.currentMethod || "Not specified"}</li>
        <li><strong>Challenges:</strong> ${surveyData.challenges?.join(", ") || "None selected"}${surveyData.challengesOther ? ` (Other: ${surveyData.challengesOther})` : ""}</li>
        <li><strong>Biggest Pain Point:</strong> ${surveyData.biggestPain || "Not specified"}</li>
      </ul>
      
      <h2>Features & Budget</h2>
      <ul>
        <li><strong>Interested Features:</strong> ${surveyData.interestedFeatures?.join(", ") || "None selected"}${surveyData.featuresOther ? ` (Other: ${surveyData.featuresOther})` : ""}</li>
        <li><strong>Budget Range:</strong> ${surveyData.budgetRange || "Not specified"}</li>
        <li><strong>Launch Interest:</strong> ${surveyData.launchInterest || "Not specified"}</li>
      </ul>
      
      ${surveyData.additionalComments ? `<h2>Additional Comments</h2><p>${surveyData.additionalComments}</p>` : ""}
    `;

    const adminEmailResponse = await sendEmail(
      ["info@optimalstockpro.com"],
      `New Survey Response from ${surveyData.fullName || surveyData.email}`,
      adminEmailHtml
    );

    console.log("Admin email sent:", adminEmailResponse);

    // Send confirmation email to user
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Thank You for Participating!</h1>
        <p>Dear ${surveyData.fullName || "Valued Customer"},</p>
        <p>Thank you for taking the time to complete our OptimalStock Pro survey. Your input helps us build inventory management software that truly meets Nigerian business needs.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">🎁 Your Rewards:</h2>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0;">✅ FREE Inventory Management Template (Excel) - <a href="https://optimalstockpro.com/template">Download here</a></li>
            <li style="padding: 8px 0;">✅ 1 MONTH FREE when we launch (First 100 people only)</li>
            <li style="padding: 8px 0;">✅ Priority early access to OptimalStock Pro</li>
            <li style="padding: 8px 0;">✅ Entry to win ₦50,000 business grant</li>
          </ul>
        </div>
        
        <p>We'll notify you as soon as OptimalStock Pro is ready for launch!</p>
        
        <p>If you have any questions, feel free to reach out:</p>
        <ul style="list-style: none; padding: 0;">
          <li>📧 Email: info@optimalstockpro.com</li>
          <li>📞 Phone: +234 814 817 0730</li>
          <li>🌐 Website: optimalstockpro.com</li>
        </ul>
        
        <p>Best regards,<br>The OptimalStock Pro Team</p>
      </div>
    `;

    const userEmailResponse = await sendEmail(
      [surveyData.email],
      "Thank You for Your Survey Response - Your Rewards Inside! 🎁",
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);