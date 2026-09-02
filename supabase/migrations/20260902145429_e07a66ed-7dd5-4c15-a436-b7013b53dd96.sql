DROP FUNCTION IF EXISTS public.run_production(uuid);
DROP FUNCTION IF EXISTS public.issue_requisition(uuid);

DROP TABLE IF EXISTS public.requisition_items CASCADE;
DROP TABLE IF EXISTS public.requisitions CASCADE;
DROP TABLE IF EXISTS public.production_consumptions CASCADE;
DROP TABLE IF EXISTS public.production_runs CASCADE;
DROP TABLE IF EXISTS public.recipe_lines CASCADE;
DROP TABLE IF EXISTS public.product_recipes CASCADE;

ALTER TABLE public.inventory_items DROP COLUMN IF EXISTS item_type;