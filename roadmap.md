# Roadmap — Manufacturing Pivot (Prefab Building Companies)

## Phase 1 — Rebrand & messaging
- [ ] Landing copy: hero, problems, features, FAQ, testimonials → prefab manufacturing
- [ ] index.html SEO metadata
- [ ] plans.ts tiers → Workshop ₦5k / Fabricator ₦8k / Factory ₦15k
- [ ] Sync Pricing.tsx, Checkout.tsx, Billing.tsx, edge plans.ts

## Phase 2 — Data model
- [ ] Migration: product_recipes, recipe_lines, production_runs, production_consumptions, requisitions, requisition_items
- [ ] inventory_items.item_type (raw|wip|finished)
- [ ] RPC: run_production (atomic deduct/add + stock_movements)
- [ ] RPC: approve_requisition → auto stock-out + movements

## Phase 3 — App features
- [ ] Bill of Materials page (nav)
- [ ] Production Runs page (nav)
- [ ] Requisitions page: form (staff name, project, material dropdown, qty) → approve auto-deducts stock
- [ ] Projects module links production runs
- [ ] Costing & waste summary on dashboard
- [ ] Manufacturing dashboard view

## Phase 4 — Repoint existing features
- [ ] Nav renames (Material Suppliers, Material Receipts, Delivery Notes)
- [ ] Move distribution/sales-channels/transfers to secondary nav
- [ ] Onboarding: warehouse → Yard/Factory, item_type in CSV import

## Phase 5 — Demo & content
- [ ] Demo: BOM + Production Runs + Requisitions with prefab sample data
- [ ] Blog: prefab-focused articles
