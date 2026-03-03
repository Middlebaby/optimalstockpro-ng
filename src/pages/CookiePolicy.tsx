import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last Updated: March 3, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
            <p>This Cookie Policy explains how OptimalstockPro ("we", "us", or "our") uses cookies and similar technologies when you visit our website at https://optimalstockpro-ng.lovable.app (the "Platform"). This policy should be read together with our <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">What Are Cookies?</h2>
            <p>Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Cookies</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">1. Essential Cookies</h3>
            <p>These cookies are necessary for the Platform to function properly. They enable:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>User authentication and account access</li>
              <li>Security and fraud prevention</li>
              <li>Session management</li>
              <li>Load balancing</li>
            </ul>
            <p>You cannot opt out of essential cookies as they are required for the Platform to work.</p>

            <h3 className="text-xl font-medium mt-6 mb-3">2. Performance and Analytics Cookies</h3>
            <p>These cookies help us understand how visitors interact with our Platform by collecting anonymous information about:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Pages visited and time spent on pages</li>
              <li>Navigation paths through the Platform</li>
              <li>Error messages encountered</li>
              <li>Device and browser information</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">3. Functional Cookies</h3>
            <p>These cookies enable enhanced functionality and personalization, such as:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Remembering your preferences and settings</li>
              <li>Language preferences</li>
              <li>Display preferences (dark mode, layout options)</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">4. Marketing and Advertising Cookies</h3>
            <p>These cookies may be used to deliver relevant advertisements, track the effectiveness of our marketing campaigns, and limit the number of times you see an advertisement.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Cookies</h2>
            <p>We may allow third-party service providers to place cookies on your device, including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Analytics providers (e.g., Google Analytics)</li>
              <li>Advertising networks</li>
              <li>Social media platforms</li>
              <li>Payment processors</li>
            </ul>
            <p>These third parties have their own privacy policies governing their use of your information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Cookie Duration</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Session cookies:</strong> Temporary cookies that expire when you close your browser</li>
              <li><strong>Persistent cookies:</strong> Cookies that remain on your device for a set period or until you delete them</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Your Cookie Choices</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">Browser Settings</h3>
            <p>You can control and manage cookies through your browser settings. Most browsers allow you to view, block, and delete cookies. Please note that blocking or deleting cookies may impact your experience on our Platform.</p>

            <h3 className="text-xl font-medium mt-6 mb-3">Opt-Out Tools</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Google Analytics Opt-out: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://tools.google.com/dlpage/gaoptout</a></li>
              <li>Network Advertising Initiative: <a href="http://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">http://www.networkadvertising.org/choices/</a></li>
              <li>Digital Advertising Alliance: <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">http://www.aboutads.info/choices/</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border mt-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-2 text-left">Cookie Name</th>
                    <th className="border border-border px-4 py-2 text-left">Purpose</th>
                    <th className="border border-border px-4 py-2 text-left">Type</th>
                    <th className="border border-border px-4 py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-4 py-2">session_id</td>
                    <td className="border border-border px-4 py-2">Maintains your login session</td>
                    <td className="border border-border px-4 py-2">Essential</td>
                    <td className="border border-border px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">auth_token</td>
                    <td className="border border-border px-4 py-2">Authenticates your identity</td>
                    <td className="border border-border px-4 py-2">Essential</td>
                    <td className="border border-border px-4 py-2">30 days</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">user_preferences</td>
                    <td className="border border-border px-4 py-2">Stores your display preferences</td>
                    <td className="border border-border px-4 py-2">Functional</td>
                    <td className="border border-border px-4 py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">_ga</td>
                    <td className="border border-border px-4 py-2">Google Analytics tracking</td>
                    <td className="border border-border px-4 py-2">Analytics</td>
                    <td className="border border-border px-4 py-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">_gid</td>
                    <td className="border border-border px-4 py-2">Google Analytics tracking</td>
                    <td className="border border-border px-4 py-2">Analytics</td>
                    <td className="border border-border px-4 py-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Updates to This Cookie Policy</h2>
            <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>Email: info@optimalstockpro.com<br />Address: Abuja, Nigeria<br />Website: https://optimalstockpro-ng.lovable.app</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights Under Nigerian Law</h2>
            <p>Under the Nigeria Data Protection Regulation (NDPR), you have rights regarding your personal data, including data collected through cookies. For more information, please see our <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Consent</h2>
            <p>By continuing to use our Platform, you consent to our use of cookies as described in this Cookie Policy. You can withdraw your consent at any time by adjusting your browser settings or contacting us directly.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
