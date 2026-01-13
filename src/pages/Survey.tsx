import Header from "@/components/landing/Header";
import SurveyHero from "@/components/survey/SurveyHero";
import SurveyBenefits from "@/components/survey/SurveyBenefits";
import SurveyDemo from "@/components/survey/SurveyDemo";
import SurveyForm from "@/components/survey/SurveyForm";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import Features from "@/components/landing/Features";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Survey = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <SurveyHero />
        <SurveyBenefits />
        <SurveyDemo />
        <SurveyForm />
        <Testimonials />
        <Pricing />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Survey;
