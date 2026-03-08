import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BarChart3, Package, ArrowDownCircle, ArrowUpCircle, Users, FileText,
  BookOpen, Home, Menu, Bell, Search, FolderKanban, ArrowRightLeft, Truck,
  Wrench, ShoppingCart, ChevronDown, ChevronRight, LogOut, User,
  Settings as SettingsIcon, ClipboardList, Shield, Lock, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import DashboardView from "@/components/demo/DashboardView";
import MasterInventory from "@/components/demo/MasterInventory";
import IncomingStock from "@/components/demo/IncomingStock";
import OutgoingStock from "@/components/demo/OutgoingStock";
import Suppliers from "@/components/demo/Suppliers";
import Reports from "@/components/demo/Reports";
import SetupGuide from "@/components/demo/SetupGuide";
import Projects from "@/components/demo/Projects";
import StoreTransfers from "@/components/demo/StoreTransfers";
import Equipment from "@/components/demo/Equipment";
import PurchaseOrders from "@/components/demo/PurchaseOrders";
import Settings from "@/components/demo/Settings";
import AdminUsers from "@/components/demo/AdminUsers";
import Distribution from "@/components/demo/Distribution";
import OnboardingTour from "@/components/demo/OnboardingTour";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proFeaturesOpen, setProFeaturesOpen] = useState(true);
  const [distFeaturesOpen, setDistFeaturesOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [triggerAddDialog, setTriggerAddDialog] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("basic");

  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Check if user is admin + fetch plan
  useEffect(() => {
    const checkRoleAndPlan = async () => {
      if (!user) return;
      const [roleRes, profileRes] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
        supabase.from('profiles').select('plan').eq('user_id', user.id).maybeSingle(),
      ]);
      setIsAdmin(!!roleRes.data);
      setUserPlan(profileRes.data?.plan || "basic");
    };
    checkRoleAndPlan();
  }, [user]);

  // Check if new user (no inventory) → show onboarding tour
  useEffect(() => {
    const checkNewUser = async () => {
      if (!user) return;
      const tourCompleted = localStorage.getItem(`tour_completed_${user.id}`);
      if (tourCompleted) return;

      const { count } = await supabase
        .from("inventory_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (count === 0) {
        setShowTour(true);
      }
    };
    checkNewUser();
  }, [user]);

  const handleTourComplete = () => {
    if (user) {
      localStorage.setItem(`tour_completed_${user.id}`, "true");
    }
    setShowTour(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  // Plan access helpers
  const hasDistribution = userPlan === "distribution" || userPlan === "professional";
  const hasProfessional = userPlan === "professional";

  const basicNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "inventory", label: "Master Inventory", icon: Package },
    { id: "incoming", label: "Incoming Stock", icon: ArrowDownCircle },
    { id: "outgoing", label: "Outgoing Stock", icon: ArrowUpCircle },
    { id: "suppliers", label: "Suppliers", icon: Users },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  const distributionNavItems = [
    { id: "distribution", label: "Distribution", icon: Truck },
  ];

  const proNavItems = [
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "transfers", label: "Store Transfers", icon: ArrowRightLeft },
    { id: "equipment", label: "Equipment & Tools", icon: Wrench },
    { id: "purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
  ];

  const distributionTabs = ["distribution"];
  const proTabs = ["projects", "transfers", "equipment", "purchase-orders"];

  const isTabLocked = (tabId: string) => {
    if (distributionTabs.includes(tabId) && !hasDistribution) return true;
    if (proTabs.includes(tabId) && !hasProfessional) return true;
    return false;
  };

  const getRequiredPlan = (tabId: string) => {
    if (distributionTabs.includes(tabId)) return "Distribution";
    if (proTabs.includes(tabId)) return "Professional";
    return "Basic";
  };

  const UpgradePrompt = ({ feature, plan }: { feature: string; plan: string }) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Crown className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
        Upgrade to {plan} Plan
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        The <span className="font-semibold text-foreground">{feature}</span> feature is available on the {plan} plan. Upgrade to unlock this and more powerful tools for your business.
      </p>
      <Button size="lg" onClick={() => navigate("/get-started")} className="gap-2">
        <Crown className="w-4 h-4" />
        Upgrade Now
      </Button>
    </div>
  );

  const renderContent = () => {
    // Check if the tab is locked
    if (isTabLocked(activeTab)) {
      return <UpgradePrompt feature={activeTab.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())} plan={getRequiredPlan(activeTab)} />;
    }

    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "inventory":
        return (
          <MasterInventory
            triggerAddDialog={triggerAddDialog}
            onAddDialogOpened={() => setTriggerAddDialog(false)}
          />
        );
      case "incoming":
        return <IncomingStock />;
      case "outgoing":
        return <OutgoingStock />;
      case "suppliers":
        return <Suppliers />;
      case "reports":
        return <Reports />;
      case "setup":
        return <SetupGuide />;
      case "projects":
        return <Projects />;
      case "transfers":
        return <StoreTransfers />;
      case "equipment":
        return <Equipment />;
      case "purchase-orders":
        return <PurchaseOrders />;
      case "distribution":
        return <Distribution />;
      case "settings":
        return <Settings />;
      case "admin-users":
        return <AdminUsers />;
      default:
        return <DashboardView />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour
          onComplete={handleTourComplete}
          onNavigate={(tab) => setActiveTab(tab)}
          onAddFirstItem={() => setTriggerAddDialog(true)}
        />
      )}

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-hero-gradient">
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-primary-foreground"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-foreground/20">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-heading font-bold text-primary-foreground">
                  Optimalstock Pro
                </span>
                <p className="text-xs text-primary-foreground/70">
                  Professional Inventory Management
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-primary-foreground/70" />
              <Input
                placeholder="Search..."
                className="border-0 bg-transparent text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-0 w-48"
              />
            </div>
            <button className="relative p-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="hidden sm:block text-sm text-primary-foreground">
                    {user.email?.split('@')[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.user_metadata?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("settings")} className="cursor-pointer">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-card border-r border-border z-40 transform transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
            Basic Features
          </p>
          {basicNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          {/* Distribution Features */}
          <div className="pt-4">
            <Collapsible open={distFeaturesOpen} onOpenChange={setDistFeaturesOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                <div className="flex items-center gap-2">
                  Distribution
                  {!hasDistribution && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                {distFeaturesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {distributionNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : isTabLocked(item.id)
                        ? "text-muted-foreground/50 hover:bg-muted"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium flex-1">{item.label}</span>
                    {isTabLocked(item.id) && <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />}
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Professional Features */}
          <div className="pt-2">
            <Collapsible open={proFeaturesOpen} onOpenChange={setProFeaturesOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                <div className="flex items-center gap-2">
                  Professional
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">PRO</Badge>
                  {!hasProfessional && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                {proFeaturesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {proNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : isTabLocked(item.id)
                        ? "text-muted-foreground/50 hover:bg-muted"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium flex-1">{item.label}</span>
                    {isTabLocked(item.id) && <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />}
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="pt-4 border-t border-border mt-4 space-y-1">
            <button
              onClick={() => { setActiveTab("setup"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "setup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Setup Guide</span>
            </button>
            <button
              onClick={() => { setActiveTab("settings"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "settings" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </div>

          {isAdmin && (
            <div className="pt-4 border-t border-border mt-4 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">Admin</p>
              <button
                onClick={() => { setActiveTab("admin-users"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "admin-users"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">User Management</span>
              </button>
              <Link
                to="/admin/survey"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setSidebarOpen(false)}
              >
                <ClipboardList className="w-5 h-5" />
                <span className="font-medium">Survey Responses</span>
              </Link>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
