// Server-side source of truth for plan pricing. Never trust client amounts.
export type PlanId = "basic" | "distribution" | "professional";

export const PLAN_PRICES: Record<PlanId, number> = {
  basic: 5000,
  distribution: 8000,
  professional: 15000,
};

export const isPlanId = (value: unknown): value is PlanId =>
  typeof value === "string" && value in PLAN_PRICES;

/** Normalise any plan-ish value (metadata, Paystack plan name) to a known id. */
export const normalizePlan = (value: unknown, fallback: PlanId = "basic"): PlanId => {
  if (isPlanId(value)) return value;
  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase();
    if (isPlanId(lowered)) return lowered;
    const match = (Object.keys(PLAN_PRICES) as PlanId[]).find((p) => lowered.includes(p));
    if (match) return match;
  }
  return fallback;
};
