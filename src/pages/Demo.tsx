import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Users,
  FileText,
  BookOpen,
  Home,
  Menu,
  Bell,
  Search,
  FolderKanban,
  ArrowRightLeft,
  Wrench,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Truck,
  Calendar,
  Activity,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
import Distribution from "@/components/demo/Distribution";
import ExpiryAlerts from "@/components/demo/ExpiryAlerts";
import ActivityLogs from "@/components/demo/ActivityLogs";
import BarcodeScanner from "@/components/demo/BarcodeScanner";
import { toast } from "sonner";

const Demo = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [distributionFeaturesOpen, setDistributionFeaturesOpen] = useState(true);
  const [proFeaturesOpen, setProFeaturesOpen] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleBarcodeScan = (code: string, format: string) => {
    toast.success(`Scanned: ${code}`, {
      description: `Format: ${format}. Item lookup ready.`,
      action: {
        label: "View Item",
        onClick: () => setActiveTab("inventory"),
      },
    });
  };

  const basicNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "inventory", label: "Master Inventory", icon: Package },
    { id: "incoming", label: "Incoming Stock", icon: ArrowDownCircle },
    { id: "outgoing", label: "Outgoing Stock", icon: ArrowUpCircle },
    { id: "expiry", label: "Expiry Tracking", icon: Calendar },
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
    { id: "activity-logs", label: "Activity Logs", icon: Activity },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "inventory":
        return <MasterInventory onOpenScanner={() => setScannerOpen(true)} />;
      case "incoming":
        return <IncomingStock />;
      case "outgoing":
        return <OutgoingStock />;
      case "expiry":
        return <ExpiryAlerts />;
      case "suppliers":
        return <Suppliers />;
      case "reports":
        return <Reports />;
      case "setup":
        return <SetupGuide />;
      case "distribution":
        return <Distribution />;
      case "projects":
        return <Projects />;
      case "transfers":
        return <StoreTransfers />;
      case "equipment":
        return <Equipment />;
      case "purchase-orders":
        return <PurchaseOrders />;
      case "activity-logs":
        return <ActivityLogs />;
      default:
        return <DashboardView />;
    }
  };

  const isDistributionFeature = distributionNavItems.some(item => item.id === activeTab);
  const isProFeature = proNavItems.some(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
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
            <button 
              className="p-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              onClick={() => setScannerOpen(true)}
              title="Scan Barcode"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button className="relative p-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>
            <Link to="/">
              <Button variant="heroOutline" size="sm">
                Exit Demo
              </Button>
            </Link>
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
          {/* Basic Features Section */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
            Basic Features
          </p>
          {basicNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
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

          {/* Distribution Features Section */}
          <div className="pt-4">
            <Collapsible open={distributionFeaturesOpen} onOpenChange={setDistributionFeaturesOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                <div className="flex items-center gap-2">
                  Distribution
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500 text-green-600">TIER 2</Badge>
                </div>
                {distributionFeaturesOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {distributionNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? "bg-green-600 text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Professional Features Section */}
          <div className="pt-2">
            <Collapsible open={proFeaturesOpen} onOpenChange={setProFeaturesOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                <div className="flex items-center gap-2">
                  Professional
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">TIER 3</Badge>
                </div>
                {proFeaturesOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {proNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
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
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Setup Guide */}
          <div className="pt-4 border-t border-border mt-4">
            <button
              onClick={() => {
                setActiveTab("setup");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "setup"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Setup Guide</span>
            </button>
          </div>
        </nav>

      </aside>

      {/* Demo Banner - Fixed at bottom */}
      <div className="fixed bottom-4 left-4 right-4 lg:left-4 lg:right-auto lg:w-56 z-30">
        <div className="bg-accent/10 backdrop-blur-sm border border-accent/20 rounded-xl p-3 text-center">
          <p className="text-xs text-accent-foreground font-medium">
            📋 This is a demo environment
          </p>
        </div>
      </div>

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

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </div>
  );
};

export default Demo;