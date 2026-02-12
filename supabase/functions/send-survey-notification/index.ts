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

    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Thank You for Participating!</h1>
        <p>Dear ${safe.fullName !== "Not provided" ? safe.fullName : "Valued Customer"},</p>
        <p>Thank you for taking the time to complete our OptimalStock Pro survey. Your input helps us build inventory management software that truly meets Nigerian business needs.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">🎁 Your Rewards:</h2>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0;">✅ FREE Inventory Management Template (Excel) - <a href="https://optimalstockpro.com/template">Download here</a></li>
            <li style="padding: 8px 0;">✅ 1 MONTH FREE when we launch (First 100 people only)</li>
            <li style="padding: 8px 0;">✅ Priority early access to OptimalStock Pro</li>
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
      JSON.stringify({ error: "Failed to send notification. Please try again later." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
