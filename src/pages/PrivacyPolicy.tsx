import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last Updated: March 3, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
            <p>OptimalstockPro ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our inventory management platform at https://optimalstockpro-ng.lovable.app (the "Platform").</p>
            <p>This Privacy Policy complies with the Nigeria Data Protection Regulation (NDPR) 2019 and other applicable data protection laws.</p>
            <p>Please read this Privacy Policy carefully. By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">1. Information You Provide to Us</h3>
            <h4 className="text-lg font-medium mt-4 mb-2">Account Information:</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full name</li>
              <li>Business name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Business address</li>
              <li>Password (encrypted)</li>
            </ul>

            <h4 className="text-lg font-medium mt-4 mb-2">Business Information:</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Business type and industry</li>
              <li>Tax identification number (TIN)</li>
              <li>Bank account details (for payment processing)</li>
              <li>Product and inventory data</li>
              <li>Supplier and customer information</li>
              <li>Transaction records</li>
            </ul>

            <h4 className="text-lg font-medium mt-4 mb-2">Communication Data:</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Support requests and correspondence</li>
              <li>Feedback and survey responses</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2. Information We Collect Automatically</h3>
            <h4 className="text-lg font-medium mt-4 mb-2">Device and Usage Information:</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Time zone settings</li>
              <li>Pages visited and features used</li>
              <li>Date and time of visits</li>
              <li>Referring website addresses</li>
            </ul>
            <p className="mt-2">As described in our <Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>, we use cookies and similar technologies to collect information about your interaction with the Platform.</p>

            <h3 className="text-xl font-medium mt-6 mb-3">3. Information from Third Parties</h3>
            <p>We may receive information about you from:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Payment processors</li>
              <li>Identity verification services</li>
              <li>Business partners and affiliates</li>
              <li>Publicly available sources</li>
              <li>Social media platforms (if you choose to connect them)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
            
            <h3 className="text-xl font-medium mt-6 mb-3">Service Delivery</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Create and manage your account</li>
              <li>Provide inventory management services</li>
              <li>Process transactions and payments</li>
              <li>Generate reports and analytics</li>
              <li>Provide customer support</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">Business Operations</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Improve and optimize the Platform</li>
              <li>Develop new features and services</li>
              <li>Conduct research and analysis</li>
              <li>Ensure Platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">Communications</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Send service-related notifications</li>
              <li>Respond to your inquiries</li>
              <li>Send newsletters and marketing materials (with your consent)</li>
              <li>Provide updates about the Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Legal Basis for Processing (NDPR Compliance)</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Consent:</strong> When you have given clear consent for us to process your personal data for a specific purpose</li>
              <li><strong>Contract:</strong> When processing is necessary for the performance of our contract with you</li>
              <li><strong>Legal Obligation:</strong> When we need to comply with Nigerian law</li>
              <li><strong>Legitimate Interests:</strong> When processing is necessary for our legitimate business interests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">How We Share Your Information</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">Service Providers</h3>
            <p>We share information with third-party vendors who perform services on our behalf: cloud hosting providers, payment processors, email service providers, analytics providers, and customer support platforms.</p>

            <h3 className="text-xl font-medium mt-6 mb-3">Business Transfers</h3>
            <p>If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>

            <h3 className="text-xl font-medium mt-6 mb-3">Legal Requirements</h3>
            <p>We may disclose your information if required by law or in response to court orders, requests from law enforcement, protection of our rights, or prevention of fraud.</p>

            <p className="mt-4 font-semibold">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your information, including encryption of data in transit and at rest, secure authentication protocols, regular security assessments, access controls, and employee training on data protection.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Data Retention</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account information: Duration of account plus 7 years</li>
              <li>Transaction records: 7 years (for tax compliance)</li>
              <li>Marketing data: Until you withdraw consent</li>
              <li>Log data: 90 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights Under NDPR</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access:</strong> Request copies of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data under certain circumstances</li>
              <li><strong>Right to Restrict Processing:</strong> Request restriction of processing</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your data to another provider</li>
              <li><strong>Right to Object:</strong> Object to processing for certain purposes</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              <li><strong>Right to Lodge a Complaint:</strong> Lodge a complaint with the Nigeria Data Protection Commission (NDPC)</li>
            </ul>
            <p className="mt-4">To exercise any of your rights, email us at <strong>info@optimalstockpro.com</strong> with the subject line "Data Subject Rights Request". We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Children's Privacy</h2>
            <p>Our Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
            <p><strong>Data Protection Officer</strong><br />OptimalstockPro<br />Email: info@optimalstockpro.com<br />Address: Lagos, Nigeria<br />Website: https://optimalstockpro-ng.lovable.app</p>
            <p className="mt-4"><strong>Nigeria Data Protection Commission (NDPC)</strong><br />Email: info@ndpc.gov.ng<br />Website: https://ndpc.gov.ng</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Consent</h2>
            <p>By using our Platform, you consent to the collection and use of your information as described in this Privacy Policy.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
