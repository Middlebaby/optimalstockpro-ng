import { useState } from "react";
import { 
  Package, 
  MapPin, 
  Phone, 
  Clock, 
  AlertTriangle,
  Plus,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Truck,
  RefreshCw,
  Send,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DistributionLocation {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  units: number;
  amountDue: number;
  product: string;
  batchId: string;
  daysToExpiry: number;
}

interface WarehouseBatch {
  id: string;
  batchId: string;
  product: string;
  quantity: number;
  productionDate: string;
  expiryDate: string;
  daysLeft: number;
  status: "active" | "expiring" | "fully_distributed";
  value: number;
}

interface DailySales {
  id: string;
  location: string;
  product: string;
  unitsSold: number;
  revenue: number;
  date: string;
}

const Distribution = () => {
  const [activeTab, setActiveTab] = useState("locations");
  const [showNewDistribution, setShowNewDistribution] = useState(false);
  const [showNewProduction, setShowNewProduction] = useState(false);
  const [showRecordSales, setShowRecordSales] = useState(false);

  const [locations] = useState<DistributionLocation[]>([
    { 
      id: "1", 
      name: "Shoprite Ikeja", 
      contactPerson: "Mr. Adebayo", 
      phone: "0801-234-5678", 
      units: 45, 
      amountDue: 15000, 
      product: "Strawberry Yoghurt 200ml", 
      batchId: "BATCH-170125",
      daysToExpiry: 12
    },
    { 
      id: "2", 
      name: "Spar Lekki", 
      contactPerson: "Mrs. Chioma", 
      phone: "0802-345-6789", 
      units: 28, 
      amountDue: 0, 
      product: "Vanilla Yoghurt 200ml", 
      batchId: "BATCH-180125",
      daysToExpiry: 13
    },
    { 
      id: "3", 
      name: "Grand Square Ajah", 
      contactPerson: "Mr. Kunle", 
      phone: "0803-456-7890", 
      units: 35, 
      amountDue: 17500, 
      product: "Strawberry Yoghurt 200ml", 
      batchId: "BATCH-150125",
      daysToExpiry: 8
    },
    { 
      id: "4", 
      name: "Justrite Festac", 
      contactPerson: "Mrs. Ngozi", 
      phone: "0804-567-8901", 
      units: 52, 
      amountDue: 0, 
      product: "Mixed Berry Yoghurt 200ml", 
      batchId: "BATCH-190125",
      daysToExpiry: 14
    },
  ]);

  const [batches] = useState<WarehouseBatch[]>([
    { id: "1", batchId: "BATCH-200125", product: "Strawberry Yoghurt 200ml", quantity: 120, productionDate: "2025-01-20", expiryDate: "2025-02-03", daysLeft: 15, status: "active", value: 36000 },
    { id: "2", batchId: "BATCH-180125", product: "Vanilla Yoghurt 200ml", quantity: 80, productionDate: "2025-01-18", expiryDate: "2025-02-01", daysLeft: 13, status: "active", value: 24000 },
    { id: "3", batchId: "BATCH-170125", product: "Strawberry Yoghurt 200ml", quantity: 45, productionDate: "2025-01-17", expiryDate: "2025-01-31", daysLeft: 12, status: "active", value: 13500 },
    { id: "4", batchId: "BATCH-150125", product: "Strawberry Yoghurt 200ml", quantity: 0, productionDate: "2025-01-15", expiryDate: "2025-01-29", daysLeft: 10, status: "fully_distributed", value: 0 },
    { id: "5", batchId: "BATCH-190125", product: "Mixed Berry Yoghurt 200ml", quantity: 95, productionDate: "2025-01-19", expiryDate: "2025-02-02", daysLeft: 14, status: "active", value: 28500 },
  ]);

  const [dailySales] = useState<DailySales[]>([
    { id: "1", location: "Shoprite Ikeja", product: "Strawberry Yoghurt 200ml", unitsSold: 12, revenue: 3600, date: "2025-01-19" },
    { id: "2", location: "Spar Lekki", product: "Vanilla Yoghurt 200ml", unitsSold: 8, revenue: 2400, date: "2025-01-19" },
    { id: "3", location: "Grand Square Ajah", product: "Strawberry Yoghurt 200ml", unitsSold: 3, revenue: 900, date: "2025-01-19" },
  ]);

  const totalStock = batches.reduce((acc, b) => acc + b.quantity, 0);
  const activeBatches = batches.filter(b => b.status === "active").length;
  const expiringBatches = batches.filter(b => b.daysLeft <= 10 && b.status !== "fully_distributed").length;
  const inventoryValue = batches.reduce((acc, b) => acc + b.value, 0);
  const totalOutstanding = locations.reduce((acc, l) => acc + l.amountDue, 0);
  const todaysRevenue = dailySales.filter(s => s.date === "2025-01-19").reduce((acc, s) => acc + s.revenue, 0);
  const todaysUnitsSold = dailySales.filter(s => s.date === "2025-01-19").reduce((acc, s) => acc + s.unitsSold, 0);

  const handleSendWhatsApp = (location: DistributionLocation) => {
    const message = encodeURIComponent(
      `STOCK COUNT REQUEST - ${location.name}\n\nHi ${location.contactPerson},\n\nPlease send today's stock count for:\n${location.product}\nBatch: ${location.batchId}\n\nFormat:\nSTOCK COUNT - ${location.name}\n${location.product}: [units remaining]\n\nThank you!`
    );
    window.open(`https://wa.me/${location.phone.replace(/-/g, '')}?text=${message}`, '_blank');
    toast.success(`WhatsApp opened for ${location.name}`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Distribution Tracking</h1>
          <p className="text-muted-foreground">Monitor stock across retail locations and track sales</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewProduction} onOpenChange={setShowNewProduction}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Production
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record New Production Batch</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Product Name</Label>
                  <Input placeholder="e.g., Strawberry Yoghurt 200ml" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label>Unit Price (₦)</Label>
                    <Input type="number" placeholder="300" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Production Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <Button className="w-full" onClick={() => {
                  toast.success("Production batch recorded!");
                  setShowNewProduction(false);
                }}>
                  Create Batch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showNewDistribution} onOpenChange={setShowNewDistribution}>
            <DialogTrigger asChild>
              <Button>
                <Truck className="w-4 h-4 mr-2" />
                New Distribution
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Distribute Stock to Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Retail Location</Label>
                  <Input placeholder="e.g., Shoprite Ikeja" />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input placeholder="e.g., Mr. Adebayo" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input placeholder="0801-234-5678" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Batch ID</Label>
                    <Input placeholder="BATCH-XXXXXX" />
                  </div>
                  <div>
                    <Label>Units to Send</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
                <Button className="w-full" onClick={() => {
                  toast.success("Stock distributed successfully!");
                  setShowNewDistribution(false);
                }}>
                  Distribute Stock
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold">{totalStock}</p>
                <p className="text-xs text-muted-foreground">units</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <RefreshCw className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Batches</p>
                <p className="text-2xl font-bold">{activeBatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={expiringBatches > 0 ? "ring-2 ring-destructive/20" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${expiringBatches > 0 ? "bg-destructive/10" : "bg-muted"}`}>
                <AlertTriangle className={`w-5 h-5 ${expiringBatches > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">{expiringBatches}</p>
                <p className="text-xs text-muted-foreground">batches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">₦{inventoryValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={totalOutstanding > 0 ? "ring-2 ring-orange-500/20" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${totalOutstanding > 0 ? "bg-orange-500/10" : "bg-muted"}`}>
                <Clock className={`w-5 h-5 ${totalOutstanding > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">₦{totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="locations" className="gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Stock by Location</span>
            <span className="sm:hidden">Locations</span>
          </TabsTrigger>
          <TabsTrigger value="warehouse" className="gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Warehouse Inventory</span>
            <span className="sm:hidden">Warehouse</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Daily Sales</span>
            <span className="sm:hidden">Sales</span>
          </TabsTrigger>
        </TabsList>

        {/* Stock by Location */}
        <TabsContent value="locations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {locations.map((location) => (
              <Card key={location.id} className={location.daysToExpiry <= 10 ? "ring-2 ring-destructive/20" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <User className="w-3 h-3" />
                        <span>{location.contactPerson}</span>
                        <span>•</span>
                        <Phone className="w-3 h-3" />
                        <span>{location.phone}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{location.units} units</p>
                      {location.amountDue > 0 && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          ₦{location.amountDue.toLocaleString()} due
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{location.product}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Batch: {location.batchId}</span>
                      <Badge variant={location.daysToExpiry <= 10 ? "destructive" : "secondary"}>
                        {location.daysToExpiry} days to expiry
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 gap-2"
                    onClick={() => handleSendWhatsApp(location)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Request Stock Count via WhatsApp
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Warehouse Inventory */}
        <TabsContent value="warehouse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Production</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-mono text-sm">{batch.batchId}</TableCell>
                        <TableCell>{batch.product}</TableCell>
                        <TableCell className="text-right font-medium">{batch.quantity}</TableCell>
                        <TableCell>{batch.productionDate}</TableCell>
                        <TableCell>{batch.expiryDate}</TableCell>
                        <TableCell>
                          <Badge variant={batch.daysLeft <= 10 ? "destructive" : "secondary"}>
                            {batch.daysLeft} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={batch.status === "active" ? "default" : batch.status === "expiring" ? "destructive" : "secondary"}
                          >
                            {batch.status === "fully_distributed" ? "Distributed" : batch.status === "expiring" ? "Expiring" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">₦{batch.value.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Sales */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">₦{todaysRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">from all locations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Units Sold Today</p>
                <p className="text-2xl font-bold">{todaysUnitsSold}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">₦32,000</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Avg Daily Sales</p>
                <p className="text-2xl font-bold">32 units</p>
              </CardContent>
            </Card>
          </div>

          {/* WhatsApp Sales Reporting */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <CardTitle className="text-green-800 dark:text-green-200">WhatsApp Sales Reporting</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                Retailers can send daily stock count via WhatsApp message
              </p>
              <div className="bg-card rounded-lg p-4 border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Example Message Format:</p>
                <div className="font-mono text-sm space-y-1 text-foreground">
                  <p>STOCK COUNT - Shoprite Ikeja</p>
                  <p>Strawberry: 35 units</p>
                  <p>Vanilla: 22 units</p>
                  <p>- Mr. Adebayo</p>
                </div>
              </div>
              <Button className="w-full mt-4 gap-2 bg-green-600 hover:bg-green-700" onClick={() => toast.info("WhatsApp template copied!")}>
                <Send className="w-4 h-4" />
                Send WhatsApp Template
              </Button>
            </CardContent>
          </Card>

          {/* Record Sales Dialog */}
          <Dialog open={showRecordSales} onOpenChange={setShowRecordSales}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Record Sales
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Daily Sales</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Location</Label>
                  <Input placeholder="e.g., Shoprite Ikeja" />
                </div>
                <div>
                  <Label>Product</Label>
                  <Input placeholder="e.g., Strawberry Yoghurt 200ml" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Units Sold</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label>Revenue (₦)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
                <Button className="w-full" onClick={() => {
                  toast.success("Sales recorded successfully!");
                  setShowRecordSales(false);
                }}>
                  Record Sales
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Recent Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.location}</TableCell>
                      <TableCell>{sale.product}</TableCell>
                      <TableCell className="text-right">{sale.unitsSold}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">₦{sale.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Distribution;