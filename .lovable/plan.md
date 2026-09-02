# Optimalstock Pro — Manufacturing Pivot (Prefabricated Building Companies)

Reposition the product from a general inventory tool for Nigerian SMEs to a purpose-built inventory + production platform for prefabrication / modular building manufacturers. Reuse the existing foundation (auth, RBAC, billing, Paystack, inventory core, lead intelligence) and reshape the domain layer.

## Guiding decisions
- **Repurpose this project** — keep auth, subscriptions, inventory core, onboarding, admin.
- **De-emphasize, don't delete** — retail POS / distribution flows stay functional but move out of the main navigation and all marketing.
- **Phased delivery** — each phase is independently shippable and verifiable.

---

## Phase 1 — Rebrand & messaging (marketing surface)
- Rewrite landing page copy for prefab manufacturers: pain points (material waste, job delays, untracked yard stock, cost overruns per project), hero, features, testimonials, FAQ.
- New tagline and SEO metadata ("Inventory & production management for Nigerian prefabrication manufacturers").
- Update `src/lib/plans.ts` tier names/features to manufacturing language:
  - **Workshop** (₦5,000) — inventory + production basics
  - **Fabricator** (₦8,000) — BOMs, work orders, multi-yard
  - **Factory** (₦15,000) — costing, scrap analytics, API/MCP
- Sync pricing copy on Pricing.tsx, Checkout.tsx, Billing.tsx, and the Paystack plan mapping in `supabase/functions/_shared/plans.ts`.

## Phase 2 — Manufacturing data model (migration)
New tables (public schema, RLS + GRANTs, admin/manager/staff hierarchy via existing `has_role`):
- `product_recipes` — BOM header: product (finished good), version, output quantity, notes.
- `recipe_lines` — BOM rows: raw material item, quantity per unit, scrap allowance %, optional sequence/stage (e.g. cut → weld → assemble).
- `production_runs` — work order: recipe, planned qty, produced qty, status (`planned|in_progress|completed|cancelled`), yard/location, started_at/completed_at, actual material cost.
- `production_consumptions` — audit of materials actually deducted per run (item, planned vs actual qty, waste).
- `inventory_items.category` gains manufacturing values (Raw Materials, Semi-finished, Finished Goods) and an `item_type` column (`raw|wip|finished`) for filtering.
- Edge-function safety: production completion performs atomic deduct/add via RPC (`run_production(run_id)`) so stock can't go negative or double-deduct.

## Phase 3 — Core app features (dashboard)
- **Bill of Materials** (new nav item): build/edit recipes per finished product; pick raw materials from inventory; shows per-unit material cost live.
- **Production Runs** (new nav item): create run from a recipe × quantity → "Start" reserves visibility, "Complete" calls the RPC to deduct raw materials, add finished goods, and log `stock_movements` (existing audit trail). Planned vs actual quantities and waste recorded.
- **Work Orders / Projects link**: extend the existing Projects module so a prefab job (e.g. "Lekki 12-unit villa") can reference production runs and allocated stock.
- **Costing & waste**: production run detail shows material cost per unit, total run cost, waste % (actual vs recipe); a summary card on the dashboard.
- Dashboard home gets a manufacturing view: WIP count, runs in progress, low-stock raw materials, finished-goods ready to deliver.

## Phase 4 — Repoint existing features
- Rename dashboard nav labels to manufacturing terms (Suppliers → Material Suppliers, Incoming Stock → Material Receipts, Receipt Printer → Delivery Notes/Receipts).
- Move `distribution`, `sales-channels`, `store transfers` under a "More" / secondary nav section (still reachable).
- Onboarding wizard (step 2/3): rename warehouse → "Yard / Factory floor"; product quick-add defaults to Raw Materials + one sample finished good; CSV import gains an `item_type` column.

## Phase 5 — Demo & content
- Public demo (Demo.tsx + demo components): add BOM and Production Runs demos with realistic prefab sample data (roof trusses, wall panels, doors).
- Blog/landing content: 2-3 prefab-focused articles (e.g. "Stop losing money on steel offcuts").

## Verification
- Migration applied with RLS policies + grants; query check as anon/authenticated.
- Playwright walk-through: create recipe → start run → complete run → confirm raw materials decreased, finished goods increased, movement logs present, waste cost shown.
- Build + typecheck green; security scan clean.

## Out of scope (later)
- Machine/IoT tracking, payroll, full MRP auto-scheduling, barcode-driven shop-floor terminals (existing barcode scanner remains usable).
