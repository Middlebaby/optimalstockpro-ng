import { useState } from "react";
import { MailCheck, Loader2, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Blocks access to protected app areas until the signed-in user has
 * confirmed their email address.
 */
const EmailVerificationGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  const verified = Boolean(user?.email_confirmed_at || (user as any)?.confirmed_at);

  if (!user || verified) return <>{children}</>;

  const handleResend = async () => {
    if (!user.email) return;
    setSending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setSending(false);
    if (error) {
      toast.error(error.message || "Could not resend the verification email.");
      return;
    }
    toast.success("Verification email sent. Check your inbox.");
  };

  const handleRecheck = async () => {
    setChecking(true);
    const { data, error } = await supabase.auth.getUser();
    setChecking(false);
    if (error || !data.user?.email_confirmed_at) {
      toast.error("Still not verified. Click the link in your email, then try again.");
      return;
    }
    await supabase.auth.refreshSession();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-card max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <MailCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-heading font-bold text-card-foreground mb-3">
          Verify your email to continue
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          We sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{user.email}</span>. Click it to unlock your
          Optimalstock Pro dashboard.
        </p>

        <div className="space-y-3">
          <Button className="w-full" onClick={handleRecheck} disabled={checking}>
            {checking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                I've verified — continue
              </>
            )}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleResend} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>
          <Button variant="ghost" className="w-full" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationGuard;
