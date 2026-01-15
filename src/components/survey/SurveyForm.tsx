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
import { supabase } from "@/integrations/supabase/client";

const SurveyForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessType: "",
    businessTypeOther: "",
    employeeCount: "",
    location: "",
    locationOther: "",
    currentMethod: "",
    challenges: [] as string[],
    challengesOther: "",
    biggestPain: "",
    interestedFeatures: [] as string[],
    featuresOther: "",
    budgetRange: "",
    launchInterest: "",
    additionalComments: "",
  });

  const businessTypes = [
    "Retail store (clothing, electronics, general goods)",
    "Wholesale/Distribution",
    "Manufacturing/Production",
    "Fashion/Boutique",
    "Supermarket/Grocery",
    "E-commerce/Online store",
  ];

  const employeeCounts = [
    "Just me (solo entrepreneur)",
    "2-5 employees",
    "6-10 employees",
    "11-25 employees",
    "26-50 employees",
    "Over 50 employees",
  ];

  const locations = [
    "Lagos",
    "Abuja",
    "Port Harcourt",
    "Ibadan",
    "Kano",
    "Kaduna",
    "Enugu",
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

  const budgetRanges = [
    "₦5,000 - ₦10,000/month",
    "₦10,000 - ₦25,000/month",
    "₦25,000 - ₦50,000/month",
    "₦50,000+/month",
    "Not sure yet",
  ];

  const launchInterests = [
    "Yes, I want early access!",
    "Maybe, tell me more first",
    "Just browsing for now",
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
    
    if (!formData.email || !formData.businessType || !formData.employeeCount || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save survey response to database
      const { error: dbError } = await supabase
        .from('survey_responses')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          business_type: formData.businessType === "Other" ? formData.businessTypeOther : formData.businessType,
          employee_count: formData.employeeCount,
          location: formData.location === "Other" ? formData.locationOther : formData.location,
          current_method: formData.currentMethod,
          challenges: formData.challenges,
          challenges_other: formData.challengesOther,
          biggest_pain: formData.biggestPain,
          interested_features: formData.interestedFeatures,
          features_other: formData.featuresOther,
          budget_range: formData.budgetRange,
          launch_interest: formData.launchInterest,
          additional_comments: formData.additionalComments,
        });

      if (dbError) {
        console.error('Error saving survey:', dbError);
        throw dbError;
      }

      // Try to send email notification (optional - won't fail submission)
      try {
        await supabase.functions.invoke('send-survey-notification', {
          body: {
            surveyData: {
              ...formData,
              businessType: formData.businessType === "Other" ? formData.businessTypeOther : formData.businessType,
              location: formData.location === "Other" ? formData.locationOther : formData.location,
            }
          }
        });
      } catch (emailError) {
        console.log('Email notification failed (non-critical):', emailError);
      }

      setIsSubmitted(true);
      toast.success("Survey submitted! Check your email for your rewards.");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                🎁 Your rewards are on the way! Here's what you'll receive:
              </p>
              <div className="bg-primary/10 rounded-xl p-6 mb-6 space-y-3 text-left">
                <p className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  FREE Inventory Management Template (Excel)
                </p>
                <p className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  1 MONTH FREE when we launch (First 100 people only)
                </p>
                <p className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Priority early access to OptimalStock Pro
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Check your email at <span className="font-semibold text-primary">{formData.email}</span> for details.
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
            <span className="text-sm text-accent font-medium">Complete & Get Rewards</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Market Research Survey
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Help us build OptimalStock Pro - simple inventory management software designed specifically for Nigerian retailers, wholesalers, and manufacturers.
          </p>
          <div className="bg-card rounded-xl p-6 max-w-xl mx-auto shadow-card">
            <p className="text-sm font-semibold text-foreground mb-3">🎁 Complete This Survey & Get:</p>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li>• FREE Inventory Management Template (Excel)</li>
              <li>• 1 MONTH FREE when we launch (First 100 people only)</li>
              <li>• Priority early access to OptimalStock Pro</li>
            </ul>
          </div>
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
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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

            {/* Business Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">About Your Business</h3>
              
              <div className="space-y-2">
                <Label>What type of business do you own or manage? *</Label>
                <RadioGroup
                  value={formData.businessType}
                  onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {businessTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`biz-${type}`} />
                      <Label htmlFor={`biz-${type}`} className="text-sm cursor-pointer">{type}</Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Other" id="biz-other" />
                    <Label htmlFor="biz-other" className="text-sm cursor-pointer">Other</Label>
                  </div>
                </RadioGroup>
                {formData.businessType === "Other" && (
                  <Input
                    placeholder="Please specify..."
                    value={formData.businessTypeOther}
                    onChange={(e) => setFormData({ ...formData, businessTypeOther: e.target.value })}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>How many employees do you have? *</Label>
                <RadioGroup
                  value={formData.employeeCount}
                  onValueChange={(value) => setFormData({ ...formData, employeeCount: value })}
                  className="grid grid-cols-2 md:grid-cols-3 gap-3"
                >
                  {employeeCounts.map((count) => (
                    <div key={count} className="flex items-center space-x-2">
                      <RadioGroupItem value={count} id={`emp-${count}`} />
                      <Label htmlFor={`emp-${count}`} className="text-sm cursor-pointer">{count}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Where's your business located? *</Label>
                <RadioGroup
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                  {locations.map((loc) => (
                    <div key={loc} className="flex items-center space-x-2">
                      <RadioGroupItem value={loc} id={`loc-${loc}`} />
                      <Label htmlFor={`loc-${loc}`} className="text-sm cursor-pointer">{loc}</Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Other" id="loc-other" />
                    <Label htmlFor="loc-other" className="text-sm cursor-pointer">Other</Label>
                  </div>
                </RadioGroup>
                {formData.location === "Other" && (
                  <Input
                    placeholder="Please specify your city..."
                    value={formData.locationOther}
                    onChange={(e) => setFormData({ ...formData, locationOther: e.target.value })}
                    className="mt-2"
                  />
                )}
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
                      <RadioGroupItem value={method} id={`method-${method}`} />
                      <Label htmlFor={`method-${method}`} className="text-sm cursor-pointer">{method}</Label>
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
                        id={`chal-${challenge}`}
                        checked={formData.challenges.includes(challenge)}
                        onCheckedChange={(checked) => handleChallengeChange(challenge, checked as boolean)}
                      />
                      <Label htmlFor={`chal-${challenge}`} className="text-sm cursor-pointer">{challenge}</Label>
                    </div>
                  ))}
                </div>
                <Input
                  placeholder="Other challenges (optional)..."
                  value={formData.challengesOther}
                  onChange={(e) => setFormData({ ...formData, challengesOther: e.target.value })}
                  className="mt-2"
                />
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
                      id={`feat-${feature}`}
                      checked={formData.interestedFeatures.includes(feature)}
                      onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                    />
                    <Label htmlFor={`feat-${feature}`} className="text-sm cursor-pointer">{feature}</Label>
                  </div>
                ))}
              </div>
              <Input
                placeholder="Other features you'd like (optional)..."
                value={formData.featuresOther}
                onChange={(e) => setFormData({ ...formData, featuresOther: e.target.value })}
              />
            </div>

            {/* Budget & Interest */}
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">Budget & Interest</h3>
              
              <div className="space-y-2">
                <Label>What's your monthly budget for inventory software?</Label>
                <RadioGroup
                  value={formData.budgetRange}
                  onValueChange={(value) => setFormData({ ...formData, budgetRange: value })}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {budgetRanges.map((range) => (
                    <div key={range} className="flex items-center space-x-2">
                      <RadioGroupItem value={range} id={`budget-${range}`} />
                      <Label htmlFor={`budget-${range}`} className="text-sm cursor-pointer">{range}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Would you like to be notified when OptimalStock Pro launches?</Label>
                <RadioGroup
                  value={formData.launchInterest}
                  onValueChange={(value) => setFormData({ ...formData, launchInterest: value })}
                  className="grid grid-cols-1 gap-3"
                >
                  {launchInterests.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <RadioGroupItem value={interest} id={`interest-${interest}`} />
                      <Label htmlFor={`interest-${interest}`} className="text-sm cursor-pointer">{interest}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalComments">Any additional comments or suggestions?</Label>
                <Textarea
                  id="additionalComments"
                  placeholder="Your feedback helps us build better..."
                  value={formData.additionalComments}
                  onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
                  rows={3}
                />
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
                    Submit & Claim Your Rewards
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Your information is secure and will only be used to improve OptimalStock Pro and send you your rewards.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default SurveyForm;