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
    price: 5000,
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
    price: 8000,
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
    price: 15000,
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

/** Returns true if the supplied ISO date is still in the future. */
export const isTrialActive = (trialEndsAt: string | null | undefined) => {
  if (!trialEndsAt) return false;
  const end = new Date(trialEndsAt);
  return !isNaN(end.getTime()) && end > new Date();
};

/**
 * Effective plan used for gating. A valid trial unlocks every feature
 * (treated as Professional) so beta users can test the full platform.
 */
export const effectivePlan = (
  userPlan: string | null | undefined,
  trialEndsAt: string | null | undefined
): PlanId => {
  if (isTrialActive(trialEndsAt)) return "professional";
  return isPlanId(userPlan) ? userPlan : "basic";
};

export const trialDaysRemaining = (trialEndsAt: string | null | undefined) => {
  if (!isTrialActive(trialEndsAt)) return 0;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

export const formatNaira = (amount: number) =>
  `₦${amount.toLocaleString("en-NG")}`;
