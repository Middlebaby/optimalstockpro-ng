import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Send, Gift, CheckCircle } from "lucide-react";

const SurveyForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    businessType: "",
    employeeCount: "",
    currentMethod: "",
    challenges: [] as string[],
    biggestPain: "",
    monthlyBudget: "",
    interestedFeatures: [] as string[],
  });

  const businessTypes = [
    "Retail/Trading",
    "Manufacturing",
    "Construction",
    "Restaurant/Food",
    "Healthcare/Pharmacy",
    "Other",
  ];

  const employeeCounts = [
    "1-5 employees",
    "6-15 employees",
    "16-50 employees",
    "50+ employees",
  ];

  const currentMethods = [
    "Paper/Notebook",
    "Excel/Spreadsheet",
    "Basic software",
    "No system (memory)",
  ];

  const challenges = [
    "Stock-outs / Running out of items",
    "Overstocking / Dead inventory",
    "Theft or missing items",
    "Time-consuming counts",
    "No visibility into stock levels",
    "Staff not accountable",
    "Can't track costs properly",
    "Multi-location management",
  ];

  const interestedFeatures = [
    "Real-time stock tracking",
    "Low stock alerts",
    "Staff accountability",
    "Professional reports",
    "Multi-location support",
    "Project-based tracking",
    "WhatsApp notifications",
    "Equipment tracking",
  ];

  const handleChallengeChange = (challenge: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      challenges: checked
        ? [...prev.challenges, challenge]
        : prev.challenges.filter((c) => c !== challenge),
    }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      interestedFeatures: checked
        ? [...prev.interestedFeatures, feature]
        : prev.interestedFeatures.filter((f) => f !== feature),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.businessType) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Survey submitted! Check your email for your 30% discount code.");
  };

  if (isSubmitted) {
    return (
      <section id="survey" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-card rounded-2xl p-10 shadow-elevated">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                Thank You for Participating!
              </h2>
              <p className="text-muted-foreground mb-6">
                We've sent your exclusive 30% discount code to your email. Check your inbox to claim your special offer.
              </p>
              <div className="bg-primary/10 rounded-xl p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-2">Your discount code:</p>
                <p className="text-2xl font-heading font-bold text-primary">SURVEY30</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Use this code at checkout to get 30% off your first 3 months.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="survey" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-4">
            <Gift className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent font-medium">Get 30% Off</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Share Your Inventory Challenges
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Help us understand your needs and receive an exclusive discount on Optimalstock.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-elevated space-y-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Your business name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@business.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone/WhatsApp Number</Label>
                <Input
                  id="phone"
                  placeholder="+234 ..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Business Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">About Your Business</h3>
              
              <div className="space-y-2">
                <Label>Business Type *</Label>
                <RadioGroup
                  value={formData.businessType}
                  onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                  className="grid grid-cols-2 md:grid-cols-3 gap-3"
                >
                  {businessTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type} className="text-sm cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Number of Employees</Label>
                <RadioGroup
                  value={formData.employeeCount}
                  onValueChange={(value) => setFormData({ ...formData, employeeCount: value })}
                  className="grid grid-cols-2 gap-3"
                >
                  {employeeCounts.map((count) => (
                    <div key={count} className="flex items-center space-x-2">
                      <RadioGroupItem value={count} id={count} />
                      <Label htmlFor={count} className="text-sm cursor-pointer">{count}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Current Inventory Method */}
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">Current Inventory Management</h3>
              
              <div className="space-y-2">
                <Label>How do you currently track inventory?</Label>
                <RadioGroup
                  value={formData.currentMethod}
                  onValueChange={(value) => setFormData({ ...formData, currentMethod: value })}
                  className="grid grid-cols-2 gap-3"
                >
                  {currentMethods.map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <RadioGroupItem value={method} id={method} />
                      <Label htmlFor={method} className="text-sm cursor-pointer">{method}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>What challenges do you face? (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {challenges.map((challenge) => (
                    <div key={challenge} className="flex items-center space-x-2">
                      <Checkbox
                        id={challenge}
                        checked={formData.challenges.includes(challenge)}
                        onCheckedChange={(checked) => handleChallengeChange(challenge, checked as boolean)}
                      />
                      <Label htmlFor={challenge} className="text-sm cursor-pointer">{challenge}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="biggestPain">What's your biggest inventory pain point?</Label>
                <Textarea
                  id="biggestPain"
                  placeholder="Tell us about your main inventory challenges..."
                  value={formData.biggestPain}
                  onChange={(e) => setFormData({ ...formData, biggestPain: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            {/* Features Interest */}
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">Features You're Interested In</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {interestedFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={formData.interestedFeatures.includes(feature)}
                      onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                    />
                    <Label htmlFor={feature} className="text-sm cursor-pointer">{feature}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit & Get 30% Off
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Your information is secure and will only be used to improve Optimalstock.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default SurveyForm;
