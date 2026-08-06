import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Mail, Lock, ArrowRight, Eye, EyeOff, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
});

const signUpSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, { message: "Please enter your full name" }).max(100),
});

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="#4285F4" d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.55z" />
    <path fill="#34A853" d="M12 24c3.11 0 5.72-1.03 7.62-2.8l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.54-2.02-6.45-4.75H1.7v2.98A11.99 11.99 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.55 14.66a7.2 7.2 0 0 1 0-4.6V7.08H1.7a12 12 0 0 0 0 10.56l3.85-2.98z" />
    <path fill="#EA4335" d="M12 4.75c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.71 1.2 15.1 0 12 0 7.35 0 3.33 2.67 1.7 6.58l3.85 2.98C6.46 6.83 9 4.75 12 4.75z" />
  </svg>
);

const Auth = () => {
  const rawMode = new URLSearchParams(window.location.search).get("mode");
  const initialMode = rawMode === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, signInWithGoogle, resetPassword, user, loading } = useAuth();
  const navigate = useNavigate();

  const rawNext = new URLSearchParams(window.location.search).get("next");
  const nextPath = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  useEffect(() => {
    if (!loading && user) {
      navigate(nextPath);
    }
  }, [user, loading, navigate, nextPath]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const schema = mode === "signup" ? signUpSchema : loginSchema;
      const result = schema.safeParse(formData);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      if (mode === "signup") {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          toast.error(
            error.message.includes("already registered")
              ? "That email already has an account. Try signing in."
              : error.message
          );
        } else {
          setAwaitingConfirmation(true);
          toast.success("Account created! Check your email to confirm it.");
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(
            error.message.includes("Invalid login credentials")
              ? "Invalid email or password"
              : error.message
          );
        } else {
          toast.success("Welcome back!");
          navigate(nextPath);
        }
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      if (nextPath !== "/dashboard") {
        sessionStorage.setItem("post_auth_redirect", nextPath);
      }
      const { error } = await signInWithGoogle();
      if (error) toast.error(error.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = formData.email.trim();
    if (!z.string().email().safeParse(email).success) {
      toast.error("Enter your email address first, then tap 'Forgot password'.");
      return;
    }
    const { error } = await resetPassword(email);
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent. Check your inbox.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">Optimalstock Pro</span>
          </Link>

          {awaitingConfirmation ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Confirm your email</h1>
              <p className="text-muted-foreground mb-6">
                We sent a confirmation link to <span className="font-medium text-foreground">{formData.email}</span>.
                Click it to activate your account, then sign in.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setAwaitingConfirmation(false);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-muted-foreground mb-6">
                {mode === "signup"
                  ? "Start tracking stock, expiry dates and sales in minutes."
                  : "Sign in to access your inventory dashboard"}
              </p>

              <Tabs value={mode} onValueChange={(v) => { setMode(v as "signin" | "signup"); setErrors({}); }} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin" />
                <TabsContent value="signup" />
              </Tabs>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full gap-3"
                onClick={handleGoogle}
                disabled={googleLoading}
              >
                <GoogleIcon />
                {googleLoading ? "Connecting…" : `Continue with Google`}
              </Button>

              <div className="flex items-center gap-4 my-6">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">or use email</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative mt-1">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Chinedu Okafor"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.fullName ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                  </div>
                )}

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                </div>

                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "signup" ? "Create account" : "Sign In"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-sm text-muted-foreground mt-6">
                {mode === "signup" ? (
                  <>
                    By creating an account you agree to our{" "}
                    <Link to="/terms-of-service" className="text-primary underline">Terms</Link> and{" "}
                    <Link to="/privacy-policy" className="text-primary underline">Privacy Policy</Link>.
                  </>
                ) : (
                  <>
                    Want to see it first?{" "}
                    <Link to="/demo" className="text-primary underline">Try the live demo</Link>.
                  </>
                )}
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-hero-gradient items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-primary-foreground max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-8">
            <BarChart3 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-heading font-bold mb-4">
            Take Control of Your Inventory
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Join 50+ Nigerian SMEs who have reduced stock-outs by 85% and saved an average of ₦500,000 annually with Optimalstock Pro.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-sm text-primary-foreground/70">Less stock-outs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">2hrs</p>
              <p className="text-sm text-primary-foreground/70">Saved daily</p>
            </div>
            <div>
              <p className="text-2xl font-bold">₦500k+</p>
              <p className="text-sm text-primary-foreground/70">Annual savings</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
