# Undo the manufacturing pivot

Return Optimalstock Pro to its pre-pivot state: original inventory/distribution positioning, no BOM/production/requisition modules.

## Two parts

**1. Code — you revert (I can't do this from chat)**
Use the History tab or the chat revert button on the message immediately before the pivot began ("So i'm rebuilding optimalstockpro, streamlining it to one industry..."). That restores in one step:
- `src/components/landing/Hero.tsx` and `Problems.tsx` (original SME copy)
- `src/lib/plans.ts` (Basic / Distribution / Professional names)
- `src/pages/Dashboard.tsx` (original nav, no Production group)
- `index.html` metadata
- Removes `src/components/manufacturing/*` and `roadmap.md`

**2. Database — I run a cleanup migration after you approve this plan**
Revert does not touch the database, so the manufacturing objects need to be dropped explicitly.

Dropped:
- Tables: `requisition_items`, `requisitions`, `production_consumptions`, `production_runs`, `recipe_lines`, `product_recipes`
- Functions: `run_production(uuid)`, `issue_requisition(uuid)`
- Column: `inventory_items.item_type`

Kept untouched (pre-existing, not part of the pivot): `production_batches`, `distributions`, `distribution_sales`, `distribution_locations`, `projects`, `stock_movements`, and everything else.

This also clears the two outstanding SECURITY DEFINER linter warnings, since both flagged functions go away.

## Order

Do the code revert first, then approve the migration — that way the app is never pointing at tables that no longer exist. If you approve this plan before reverting, the Dashboard will error on the Production tabs until the revert lands.

## Verification

After both steps: landing page shows the original SME copy, dashboard has no Production group, plan names read Basic/Distribution/Professional, and the security linter runs clean.
