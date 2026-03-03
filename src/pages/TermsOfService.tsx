import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last Updated: March 3, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using the OptimalstockPro inventory management platform at https://optimalstockpro-ng.lovable.app (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p>OptimalstockPro provides a cloud-based inventory management platform designed for Nigerian small and medium enterprises (SMEs). Our services include:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Inventory tracking and management</li>
              <li>Stock movement recording</li>
              <li>Supplier management</li>
              <li>Purchase order management</li>
              <li>Reporting and analytics</li>
              <li>Equipment tracking</li>
              <li>Project-based inventory allocation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Registration</h2>
            <p>To use the Platform, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update your information if it changes</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Obligations</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Platform only for lawful purposes</li>
              <li>Not attempt to gain unauthorized access to the Platform or its systems</li>
              <li>Not use the Platform to store or transmit malicious code</li>
              <li>Not interfere with or disrupt the Platform's operation</li>
              <li>Comply with all applicable Nigerian laws and regulations</li>
              <li>Not resell or redistribute access to the Platform without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Subscription and Payment</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">5.1 Plans</h3>
            <p>The Platform offers various subscription plans with different features and pricing. Details of available plans are provided on our pricing page.</p>

            <h3 className="text-xl font-medium mt-6 mb-3">5.2 Payment</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>All fees are quoted in Nigerian Naira (₦) unless otherwise stated</li>
              <li>Payment is due at the beginning of each billing cycle</li>
              <li>We accept payment methods as listed on the Platform</li>
              <li>All fees are non-refundable unless otherwise stated</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">5.3 Free Trial</h3>
            <p>We may offer a free trial period. At the end of the trial, you will need to subscribe to a paid plan to continue using the Platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Ownership</h2>
            <p>You retain all ownership rights to the data you input into the Platform. We do not claim ownership of your business data, inventory records, or any other content you create within the Platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Intellectual Property</h2>
            <p>The Platform, including its design, features, code, and content (excluding user data), is the intellectual property of OptimalstockPro. You may not copy, modify, distribute, or create derivative works based on the Platform without our written consent.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Service Availability</h2>
            <p>We strive to maintain high availability of the Platform but do not guarantee uninterrupted access. We may temporarily suspend the Platform for maintenance, updates, or security reasons. We will provide reasonable notice of planned downtime when possible.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by Nigerian law:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>OptimalstockPro shall not be liable for any indirect, incidental, special, or consequential damages</li>
              <li>Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim</li>
              <li>We are not liable for losses resulting from unauthorized access to your account</li>
              <li>We are not responsible for data loss due to circumstances beyond our reasonable control</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Termination</h2>
            <p>Either party may terminate the agreement at any time. Upon termination:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your access to the Platform will be revoked</li>
              <li>You may request export of your data within 30 days</li>
              <li>We will delete your data after the retention period specified in our Privacy Policy</li>
              <li>Any outstanding fees remain payable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Dispute Resolution</h2>
            <p>Any disputes arising from these Terms shall be resolved through:</p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Good faith negotiation between the parties</li>
              <li>Mediation under the laws of the Federal Republic of Nigeria</li>
              <li>Arbitration in accordance with Nigerian Arbitration and Conciliation Act</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on the Platform and sending an email notification. Your continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">14. Contact Us</h2>
            <p>For questions about these Terms, please contact us:</p>
            <p>Email: info@optimalstockpro.com<br />Address: Abuja, Nigeria<br />Website: https://optimalstockpro-ng.lovable.app</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
