import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  Smartphone,
  Wifi,
  WifiOff,
  Zap,
  Bell,
  Shield,
  CheckCircle2,
  ArrowLeft,
  Share,
  MoreVertical,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch (err) {
      console.error("Install error:", err);
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const features = [
    { icon: WifiOff, title: "Works Offline", description: "Access your inventory data even without internet" },
    { icon: Zap, title: "Lightning Fast", description: "Native-like performance with instant loading" },
    { icon: Bell, title: "Push Notifications", description: "Get real-time alerts for low stock & expiry" },
    { icon: Shield, title: "Secure & Private", description: "Your data stays safe on your device" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-heading font-bold text-foreground">Install App</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            {isInstalled ? "App Installed! ✅" : "Install OptimalStock Pro"}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isInstalled
              ? "OptimalStock Pro is installed on your device. Open it from your home screen for the best experience."
              : "Add OptimalStock Pro to your home screen for instant access and offline functionality."}
          </p>
        </motion.div>

        {/* Install Button or Status */}
        {!isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {deferredPrompt ? (
              <Button
                onClick={handleInstall}
                disabled={installing}
                size="lg"
                className="w-full h-14 text-lg gap-3"
              >
                <Download className="w-5 h-5" />
                {installing ? "Installing..." : "Install App Now"}
              </Button>
            ) : (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 space-y-4">
                  {isIOS ? (
                    <>
                      <h3 className="font-heading font-semibold text-foreground">Install on iPhone/iPad</h3>
                      <div className="space-y-3">
                        <Step number={1} icon={<Share className="w-4 h-4" />}>
                          Tap the <strong>Share</strong> button at the bottom of Safari
                        </Step>
                        <Step number={2} icon={<Plus className="w-4 h-4" />}>
                          Scroll down and tap <strong>"Add to Home Screen"</strong>
                        </Step>
                        <Step number={3} icon={<CheckCircle2 className="w-4 h-4" />}>
                          Tap <strong>"Add"</strong> to confirm
                        </Step>
                      </div>
                    </>
                  ) : isAndroid ? (
                    <>
                      <h3 className="font-heading font-semibold text-foreground">Install on Android</h3>
                      <div className="space-y-3">
                        <Step number={1} icon={<MoreVertical className="w-4 h-4" />}>
                          Tap the <strong>menu (⋮)</strong> button in Chrome
                        </Step>
                        <Step number={2} icon={<Plus className="w-4 h-4" />}>
                          Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>
                        </Step>
                        <Step number={3} icon={<CheckCircle2 className="w-4 h-4" />}>
                          Tap <strong>"Install"</strong> to confirm
                        </Step>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-heading font-semibold text-foreground">Install on Desktop</h3>
                      <div className="space-y-3">
                        <Step number={1} icon={<Download className="w-4 h-4" />}>
                          Look for the <strong>install icon</strong> (⊕) in the address bar
                        </Step>
                        <Step number={2} icon={<CheckCircle2 className="w-4 h-4" />}>
                          Click <strong>"Install"</strong> to add to your desktop
                        </Step>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-4 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Network Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {navigator.onLine ? "You're online" : "You're offline"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {navigator.onLine
                    ? "App data will sync automatically"
                    : "Changes will sync when you're back online"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link to="/demo">
            <Button variant="outline" className="gap-2">
              Try the Demo
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

const Step = ({
  number,
  icon,
  children,
}: {
  number: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
      {number}
    </div>
    <div className="flex items-center gap-2 text-sm text-foreground pt-0.5">
      {icon}
      <span>{children}</span>
    </div>
  </div>
);

export default Install;
