export type PlanId = "basic" | "distribution" | "professional";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // NGN per month
  tagline: string;
  features: string[];
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 8000,
    tagline: "Core inventory for a single shop or store.",
    features: [
      "Unlimited products & stock movements",
      "Low-stock & expiry alerts",
      "Barcode / QR scanning",
      "CSV import & reports",
      "Email notifications",
    ],
  },
  {
    id: "distribution",
    name: "Distribution",
    price: 12000,
    tagline: "For businesses supplying multiple locations.",
    popular: true,
    features: [
      "Everything in Basic",
      "Multi-location distribution hub",
      "Debt & payment tracking per location",
      "Sales channels & receipt printing",
      "WhatsApp alerts",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 18000,
    tagline: "Full operations for manufacturing & projects.",
    features: [
      "Everything in Distribution",
      "Projects & material allocation",
      "Store transfers & equipment tracking",
      "Purchase orders & suppliers",
      "Staff roles & audit logs",
    ],
  },
];

export const getPlan = (id: string | null | undefined) =>
  PLANS.find((p) => p.id === id) ?? PLANS[1];

export const formatNaira = (amount: number) =>
  `₦${amount.toLocaleString("en-NG")}`;
