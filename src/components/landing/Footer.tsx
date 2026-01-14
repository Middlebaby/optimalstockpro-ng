import { Link } from "react-router-dom";
import { BarChart3, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-heading font-bold">
                Optimalstock
              </span>
            </Link>
            <p className="text-primary-foreground/70 mb-6 max-w-md">
              Professional inventory management built specifically for Nigerian SMEs. Take control of your stock, reduce losses, and grow your business.
            </p>
            <div className="space-y-2">
              <a href="mailto:info@optimalstockpro.com" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                info@optimalstockpro.com
              </a>
              <a href="tel:+2348148170730" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                +234 814 817 0730
              </a>
              <p className="flex items-center gap-2 text-primary-foreground/70">
                <MapPin className="w-4 h-4" />
                Abuja, Nigeria
              </p>
              <a href="https://optimalstockpro.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary transition-colors">
                🌐 optimalstockpro.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#faq" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link to="/demo" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Try Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-primary-foreground/50 text-sm">
          © {new Date().getFullYear()} Optimalstock. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;