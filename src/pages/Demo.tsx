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
  X,
  Bell,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

import DashboardView from "@/components/demo/DashboardView";
import MasterInventory from "@/components/demo/MasterInventory";
import IncomingStock from "@/components/demo/IncomingStock";
import OutgoingStock from "@/components/demo/OutgoingStock";
import Suppliers from "@/components/demo/Suppliers";
import Reports from "@/components/demo/Reports";
import SetupGuide from "@/components/demo/SetupGuide";

const Demo = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "inventory", label: "Master Inventory", icon: Package },
    { id: "incoming", label: "Incoming Stock", icon: ArrowDownCircle },
    { id: "outgoing", label: "Outgoing Stock", icon: ArrowUpCircle },
    { id: "suppliers", label: "Suppliers", icon: Users },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "setup", label: "Setup Guide", icon: BookOpen },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "inventory":
        return <MasterInventory />;
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
      default:
        return <DashboardView />;
    }
  };

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
                  Optimalstock
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
        className={`fixed top-16 left-0 bottom-0 w-64 bg-card border-r border-border z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
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
        </nav>

        {/* Demo Banner */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-accent/10 rounded-xl p-4 text-center">
            <p className="text-sm text-accent-foreground font-medium mb-2">
              This is a demo environment
            </p>
            <Link to="/get-started">
              <Button variant="accent" size="sm" className="w-full">
                Get Full Access
              </Button>
            </Link>
          </div>
        </div>
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

export default Demo;