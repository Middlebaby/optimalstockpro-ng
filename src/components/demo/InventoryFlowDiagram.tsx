import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfDay } from "date-fns";
import { 
  Truck, 
  Warehouse, 
  Package, 
  ClipboardCheck, 
  Store, 
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StageItem {
  id: string;
  name: string;
  sku: string;
  quantity: string;
  arrivedAt: string;
  status: "waiting" | "in-progress" | "ready";
}

interface InventoryFlowDiagramProps {
  onNavigate?: (tab: string) => void;
}

const stepToTab: Record<number, string> = {
  0: "incoming",
  1: "incoming",
  2: "inventory",
  3: "outgoing",
  4: "distribution",
};

const stepToTabLabel: Record<number, string> = {
  0: "Incoming Stock",
  1: "Incoming Stock",
  2: "Master Inventory",
  3: "Outgoing Stock",
  4: "Distribution",
};

const InventoryFlowDiagram = ({ onNavigate }: InventoryFlowDiagramProps) => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  
  const { user } = useAuth();
  
  // Live data state
  const [incomingItems, setIncomingItems] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [outgoingItems, setOutgoingItems] = useState<any[]>([]);
  const [distributionItems, setDistributionItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const today = format(startOfDay(new Date()), "yyyy-MM-dd'T'HH:mm:ss");

    const fetchAll = async () => {
      const [incRes, invRes, outRes, distRes] = await Promise.all([
        supabase
          .from("stock_movements")
          .select("id, quantity, notes, created_at, movement_type, inventory_items(name, sku)")
          .eq("user_id", user.id)
          .eq("movement_type", "incoming")
          .gte("created_at", today)
          .order("created_at", { ascending: false }),
        supabase
          .from("inventory_items")
          .select("id, name, sku, quantity, unit, is_logged, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("stock_movements")
          .select("id, quantity, notes, created_at, movement_type, inventory_items(name, sku)")
          .eq("user_id", user.id)
          .in("movement_type", ["outgoing", "sale", "transfer"])
          .gte("created_at", today)
          .order("created_at", { ascending: false }),
        supabase
          .from("distributions")
          .select("id, quantity, status, created_at, production_batches(product_name, batch_number)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      setIncomingItems(incRes.data || []);
      setInventoryItems(invRes.data || []);
      setOutgoingItems(outRes.data || []);
      setDistributionItems(distRes.data || []);
    };

    fetchAll();
  }, [user]);

  // Derive counts per step
  const unloggedItems = useMemo(() => inventoryItems.filter(i => !i.is_logged), [inventoryItems]);
  const loggedItems = useMemo(() => inventoryItems.filter(i => i.is_logged), [inventoryItems]);

  const stepCounts = useMemo(() => ({
    0: incomingItems.length,          // Receiving
    1: unloggedItems.length,          // Quality Check (unverified)
    2: loggedItems.length,            // Warehouse (verified inventory)
    3: outgoingItems.length,          // Pick & Pack
    4: distributionItems.length,      // Distribution
  }), [incomingItems, unloggedItems, loggedItems, outgoingItems, distributionItems]);

  // Find most recent item across all movements
  const recentItem = useMemo(() => {
    const allMovements = [...incomingItems, ...outgoingItems];
    if (allMovements.length === 0) return null;
    const latest = allMovements[0];
    const itemName = (latest as any).inventory_items?.name || "Unknown Item";
    const itemSku = (latest as any).inventory_items?.sku || "N/A";
    return {
      name: itemName,
      sku: itemSku,
      arrivedAt: format(new Date(latest.created_at), "h:mm a"),
    };
  }, [incomingItems, outgoingItems]);

  // Determine current step based on where recent activity is
  const currentItemStep = useMemo(() => {
    if (distributionItems.length > 0) return 4;
    if (outgoingItems.length > 0) return 3;
    if (loggedItems.length > 0) return 2;
    if (unloggedItems.length > 0) return 1;
    if (incomingItems.length > 0) return 0;
    return 0;
  }, [incomingItems, unloggedItems, loggedItems, outgoingItems, distributionItems]);

  // Build stage items for dialog from real data
  const stageItems: Record<number, StageItem[]> = useMemo(() => ({
    0: incomingItems.slice(0, 10).map(m => ({
      id: m.id,
      name: (m as any).inventory_items?.name || "Item",
      sku: (m as any).inventory_items?.sku || "N/A",
      quantity: `${m.quantity} units`,
      arrivedAt: format(new Date(m.created_at), "h:mm a"),
      status: "in-progress" as const,
    })),
    1: unloggedItems.slice(0, 10).map(i => ({
      id: i.id,
      name: i.name,
      sku: i.sku || "N/A",
      quantity: `${i.quantity} ${i.unit || "pcs"}`,
      arrivedAt: format(new Date(i.created_at), "h:mm a"),
      status: "waiting" as const,
    })),
    2: loggedItems.slice(0, 10).map(i => ({
      id: i.id,
      name: i.name,
      sku: i.sku || "N/A",
      quantity: `${i.quantity} ${i.unit || "pcs"}`,
      arrivedAt: format(new Date(i.created_at), "h:mm a"),
      status: "ready" as const,
    })),
    3: outgoingItems.slice(0, 10).map(m => ({
      id: m.id,
      name: (m as any).inventory_items?.name || "Item",
      sku: (m as any).inventory_items?.sku || "N/A",
      quantity: `${m.quantity} units`,
      arrivedAt: format(new Date(m.created_at), "h:mm a"),
      status: "in-progress" as const,
    })),
    4: distributionItems.slice(0, 10).map(d => ({
      id: d.id,
      name: (d as any).production_batches?.product_name || "Batch",
      sku: (d as any).production_batches?.batch_number || "N/A",
      quantity: `${d.quantity} units`,
      arrivedAt: format(new Date(d.created_at), "h:mm a"),
      status: d.status === "delivered" ? "ready" as const : "in-progress" as const,
    })),
  }), [incomingItems, unloggedItems, loggedItems, outgoingItems, distributionItems]);

  const steps = [
    { icon: Truck, title: "Receiving", description: "Stock arrives from suppliers", color: "bg-primary" },
    { icon: ClipboardCheck, title: "Quality Check", description: "Verify & log incoming items", color: "bg-primary-glow" },
    { icon: Warehouse, title: "Warehouse", description: "Store in master inventory", color: "bg-primary" },
    { icon: Package, title: "Pick & Pack", description: "Prepare for distribution", color: "bg-accent" },
    { icon: Store, title: "Distribution", description: "Dispatch to retail locations", color: "bg-primary-glow" },
  ];

  const getStepStatus = (index: number) => {
    if (index < currentItemStep) return "completed";
    if (index === currentItemStep) return "current";
    return "pending";
  };

  const getStatusBadge = (status: StageItem["status"]) => {
    switch (status) {
      case "waiting":
        return <Badge variant="secondary" className="text-xs">Waiting</Badge>;
      case "in-progress":
        return <Badge className="text-xs bg-accent text-accent-foreground">In Progress</Badge>;
      case "ready":
        return <Badge className="text-xs bg-primary text-primary-foreground">Ready</Badge>;
    }
  };

  const handleStepClick = (index: number) => {
    setSelectedStep(index);
  };

  return (
    <>
      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="mb-6">
          <h2 className="text-lg font-heading font-semibold text-card-foreground">
            Inventory Flow
          </h2>
          <p className="text-sm text-muted-foreground">
            How stock moves through your system • Click any step to view items
          </p>
        </div>

        {/* Recent Item Progress Tracker */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-card-foreground">Latest Item Tracking</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{recentItem.arrivedAt}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-medium text-card-foreground text-sm">{recentItem.name}</p>
              <p className="text-xs text-muted-foreground">SKU: {recentItem.sku}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                {steps[currentItemStep].title}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 relative">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentItemStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
              />
            </div>
            <div className="flex justify-between mt-1">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`w-1 h-1 rounded-full ${
                    index <= currentItemStep ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Desktop Flow */}
        <div className="hidden md:flex items-center justify-between gap-2">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const itemCount = stageItems[index]?.length || 0;
            return (
              <div key={index} className="flex items-center flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center text-center flex-1 cursor-pointer group"
                  onClick={() => handleStepClick(index)}
                >
                  <div
                    className={`${
                      status === "current" 
                        ? step.color + " ring-4 ring-primary/30" 
                        : status === "completed"
                          ? step.color
                          : "bg-muted"
                    } w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-lg relative transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                  >
                    <step.icon className={`w-6 h-6 ${
                      status === "pending" ? "text-muted-foreground" : "text-primary-foreground"
                    }`} />
                    
                    {/* Item count badge */}
                    {itemCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                        {itemCount}
                      </div>
                    )}
                    
                    {status === "completed" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="absolute -bottom-1 -right-1 bg-background rounded-full"
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                    
                    {status === "current" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="absolute -bottom-1 -right-1 bg-background rounded-full"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Circle className="w-5 h-5 text-accent fill-accent" />
                        </motion.div>
                      </motion.div>
                    )}
                    
                    {status === "pending" && (
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full">
                        <Circle className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <h3 className={`font-medium text-sm mb-1 group-hover:text-primary transition-colors ${
                    status === "pending" ? "text-muted-foreground" : "text-card-foreground"
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {step.description}
                  </p>
                </motion.div>
                
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="flex-shrink-0 px-2"
                  >
                    <ArrowRight className={`w-5 h-5 ${
                      index < currentItemStep ? "text-primary" : "text-muted-foreground/40"
                    }`} />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Flow */}
        <div className="md:hidden space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const itemCount = stageItems[index]?.length || 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform ${
                  status === "current" ? "bg-primary/5 -mx-2 px-2 py-2 rounded-lg" : ""
                }`}
                onClick={() => handleStepClick(index)}
              >
                <div className="relative">
                  <div
                    className={`${
                      status === "current" 
                        ? step.color + " ring-4 ring-primary/30" 
                        : status === "completed"
                          ? step.color
                          : "bg-muted"
                    } w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300`}
                  >
                    <step.icon className={`w-5 h-5 ${
                      status === "pending" ? "text-muted-foreground" : "text-primary-foreground"
                    }`} />
                  </div>
                  {/* Item count badge */}
                  {itemCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                      {itemCount}
                    </div>
                  )}
                  {index < steps.length - 1 && (
                    <div className={`absolute left-1/2 top-12 w-0.5 h-4 -translate-x-1/2 ${
                      index < currentItemStep ? "bg-primary" : "bg-border"
                    }`} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium text-sm ${
                    status === "pending" ? "text-muted-foreground" : "text-card-foreground"
                  }`}>
                    {step.title}
                    {status === "current" && (
                      <span className="ml-2 text-xs text-primary font-normal">(Current)</span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {itemCount > 0 && (
                    <span className="text-xs text-muted-foreground">{itemCount} items</span>
                  )}
                  {status === "completed" && (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                  {status === "current" && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Circle className="w-5 h-5 text-accent fill-accent flex-shrink-0" />
                    </motion.div>
                  )}
                  {status === "pending" && (
                    <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Stats */}
        <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-heading font-bold text-primary">24</p>
            <p className="text-xs text-muted-foreground">Items Received Today</p>
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-accent">18</p>
            <p className="text-xs text-muted-foreground">In Processing</p>
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-primary-glow">12</p>
            <p className="text-xs text-muted-foreground">Distributed</p>
          </div>
        </div>
      </div>

      {/* Stage Items Dialog */}
      <Dialog open={selectedStep !== null} onOpenChange={(open) => !open && setSelectedStep(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedStep !== null && (
                <>
                  <div className={`${steps[selectedStep].color} w-10 h-10 rounded-full flex items-center justify-center`}>
                    {(() => {
                      const StepIcon = steps[selectedStep].icon;
                      return <StepIcon className="w-5 h-5 text-primary-foreground" />;
                    })()}
                  </div>
                  <div>
                    <span>{steps[selectedStep].title}</span>
                    <p className="text-sm font-normal text-muted-foreground">
                      {steps[selectedStep].description}
                    </p>
                  </div>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Items currently at this workflow stage
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px] pr-4">
            {selectedStep !== null && stageItems[selectedStep]?.length > 0 ? (
              <div className="space-y-3">
                {stageItems[selectedStep].map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-muted/50 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-card-foreground">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium text-card-foreground">{item.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Arrived:</span>
                      <span className="text-card-foreground">{item.arrivedAt}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No items at this stage</p>
              </div>
            )}
          </ScrollArea>
          
          {selectedStep !== null && (
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {(stageItems[selectedStep]?.length || 0)} item{(stageItems[selectedStep]?.length || 0) !== 1 ? 's' : ''} at this stage
              </p>
              {onNavigate && (
                <Button
                  size="sm"
                  onClick={() => {
                    onNavigate(stepToTab[selectedStep]);
                    setSelectedStep(null);
                  }}
                  className="gap-1"
                >
                  Go to {stepToTabLabel[selectedStep]}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InventoryFlowDiagram;
