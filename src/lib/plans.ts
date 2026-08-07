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

export const PLAN_IDS: PlanId[] = ["basic", "distribution", "professional"];

/** Safeguard: only ever trust a value that is a real plan id. */
export const isPlanId = (value: unknown): value is PlanId =>
  typeof value === "string" && (PLAN_IDS as string[]).includes(value);

/** Canonical price map — the single source of truth used by checkout + billing. */
export const PLAN_PRICES: Record<PlanId, number> = {
  basic: 5000,
  distribution: 8000,
  professional: 15000,
};

export const getPlan = (id: string | null | undefined): Plan =>
  (isPlanId(id) ? PLANS.find((p) => p.id === id) : undefined) ?? PLANS[1];

/** Rank for upgrade/downgrade comparisons. */
export const planRank = (id: string | null | undefined) =>
  isPlanId(id) ? PLAN_IDS.indexOf(id) : -1;

export const formatNaira = (amount: number) =>
  `₦${amount.toLocaleString("en-NG")}`;
