import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, ArrowRight, CheckCircle } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const GetStarted = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    businessType: "",
    employees: "",
    plan: "professional",
    acceptTerms: false,
  });

  const businessTypes = [
    "Retail Store",
    "Manufacturing",
    "Restaurant/Food Service",
    "Wholesale",
    "Healthcare/Pharmacy",
    "Electronics",
    "Fashion/Clothing",
    "Agriculture",
    "Other",
  ];

  const employeeCounts = [
    "Just me",
    "2-5 employees",
    "6-10 employees",
    "11-25 employees",
    "26-50 employees",
    "50+ employees",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // In a real app, this would submit to a backend
      setStep(4);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-semibold transition-colors ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-20 h-1 mx-2 rounded transition-colors ${
                        step > s ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {step < 4 ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card rounded-2xl p-8 shadow-elevated"
              >
                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <>
                      <h1 className="text-2xl font-heading font-bold text-card-foreground mb-2">
                        Tell us about your business
                      </h1>
                      <p className="text-muted-foreground mb-8">
                        We'll customize Optimalstock to fit your needs.
                      </p>
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="businessName">Business Name</Label>
                          <Input
                            id="businessName"
                            value={formData.businessName}
                            onChange={(e) =>
                              setFormData({ ...formData, businessName: e.target.value })
                            }
                            placeholder="Your Business Name"
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="businessType">Type of Business</Label>
                          <Select
                            value={formData.businessType}
                            onValueChange={(value) =>
                              setFormData({ ...formData, businessType: value })
                            }
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select your business type" />
                            </SelectTrigger>
                            <SelectContent>
                              {businessTypes.map((type) => (
                                <SelectItem key={type} value={type.toLowerCase()}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="employees">Number of Employees</Label>
                          <Select
                            value={formData.employees}
                            onValueChange={(value) =>
                              setFormData({ ...formData, employees: value })
                            }
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select employee count" />
                            </SelectTrigger>
                            <SelectContent>
                              {employeeCounts.map((count) => (
                                <SelectItem key={count} value={count.toLowerCase()}>
                                  {count}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h1 className="text-2xl font-heading font-bold text-card-foreground mb-2">
                        Your contact information
                      </h1>
                      <p className="text-muted-foreground mb-8">
                        We'll use this to set up your account.
                      </p>
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="you@business.com"
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            placeholder="+234 801 234 5678"
                            required
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h1 className="text-2xl font-heading font-bold text-card-foreground mb-2">
                        Choose your plan
                      </h1>
                      <p className="text-muted-foreground mb-8">
                        Start with a 14-day free trial. Cancel anytime.
                      </p>
                      <div className="space-y-4 mb-8">
                        {[
                          { id: "starter", name: "Starter", price: "₦15,000/mo" },
                          { id: "professional", name: "Professional", price: "₦35,000/mo", popular: true },
                          { id: "enterprise", name: "Enterprise", price: "Custom" },
                        ].map((plan) => (
                          <label
                            key={plan.id}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.plan === plan.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="plan"
                                value={plan.id}
                                checked={formData.plan === plan.id}
                                onChange={(e) =>
                                  setFormData({ ...formData, plan: e.target.value })
                                }
                                className="sr-only"
                              />
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  formData.plan === plan.id
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground"
                                }`}
                              >
                                {formData.plan === plan.id && (
                                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                )}
                              </div>
                              <div>
                                <span className="font-heading font-semibold text-card-foreground">
                                  {plan.name}
                                </span>
                                {plan.popular && (
                                  <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                    Popular
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-semibold text-foreground">
                              {plan.price}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={formData.acceptTerms}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, acceptTerms: checked as boolean })
                          }
                        />
                        <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                          I agree to the Terms of Service and Privacy Policy. I understand I can cancel my subscription at any time.
                        </Label>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between mt-8">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep(step - 1)}
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className={step === 1 ? "ml-auto" : ""}
                      disabled={step === 3 && !formData.acceptTerms}
                    >
                      {step === 3 ? "Start Free Trial" : "Continue"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
                  You're all set!
                </h1>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Your account has been created. You can now access your inventory management dashboard.
                </p>
                <Link to="/demo">
                  <Button size="xl">
                    <BarChart3 className="w-5 h-5" />
                    Go to Dashboard
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GetStarted;