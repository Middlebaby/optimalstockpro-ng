-- ============ Manufacturing pivot: BOM, production runs, requisitions ============

ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'raw';

CREATE TABLE IF NOT EXISTS public.product_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_item_id uuid not null references public.inventory_items(id) on delete cascade,
  recipe_name text not null,
  version integer not null default 1,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.recipe_lines (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.product_recipes(id) on delete cascade,
  material_item_id uuid not null references public.inventory_items(id) on delete cascade,
  quantity_per_unit numeric not null default 1,
  scrap_allowance_pct numeric not null default 0,
  stage text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.production_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  recipe_id uuid not null references public.product_recipes(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  planned_quantity integer not null default 1,
  produced_quantity integer not null default 0,
  status text not null default 'planned',
  location text,
  started_at timestamptz,
  completed_at timestamptz,
  actual_material_cost numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.production_consumptions (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.production_runs(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  planned_quantity numeric not null default 0,
  actual_quantity numeric not null default 0,
  unit_cost numeric not null default 0,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.requisitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  requested_by_name text not null,
  project_id uuid references public.projects(id) on delete set null,
  project_name text,
  status text not null default 'pending',
  notes text,
  approved_by uuid,
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.requisition_items (
  id uuid primary key default gen_random_uuid(),
  requisition_id uuid not null references public.requisitions(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity integer not null default 1,
  quantity_issued integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_recipes, public.recipe_lines, public.production_runs, public.production_consumptions, public.requisitions, public.requisition_items TO authenticated;
GRANT ALL ON public.product_recipes, public.recipe_lines, public.production_runs, public.production_consumptions, public.requisitions, public.requisition_items TO service_role;
GRANT UPDATE (item_type) ON public.inventory_items TO authenticated;

-- RLS
ALTER TABLE public.product_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisition_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipes_owner_all" ON public.product_recipes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "recipe_lines_owner_all" ON public.recipe_lines FOR ALL TO authenticated USING (
  exists (select 1 from public.product_recipes r where r.id = recipe_id and r.user_id = auth.uid())
) WITH CHECK (
  exists (select 1 from public.product_recipes r where r.id = recipe_id and r.user_id = auth.uid())
);
CREATE POLICY "runs_owner_all" ON public.production_runs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "consumptions_owner_all" ON public.production_consumptions FOR ALL TO authenticated USING (
  exists (select 1 from public.production_runs r where r.id = run_id and r.user_id = auth.uid())
) WITH CHECK (
  exists (select 1 from public.production_runs r where r.id = run_id and r.user_id = auth.uid())
);
CREATE POLICY "requisitions_owner_all" ON public.requisitions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "requisition_items_owner_all" ON public.requisition_items FOR ALL TO authenticated USING (
  exists (select 1 from public.requisitions r where r.id = requisition_id and r.user_id = auth.uid())
) WITH CHECK (
  exists (select 1 from public.requisitions r where r.id = requisition_id and r.user_id = auth.uid())
);

-- updated_at triggers
CREATE TRIGGER update_product_recipes_updated_at BEFORE UPDATE ON public.product_recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_production_runs_updated_at BEFORE UPDATE ON public.production_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_requisitions_updated_at BEFORE UPDATE ON public.requisitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Atomic production completion ============
CREATE OR REPLACE FUNCTION public.run_production(p_run_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_run public.production_runs%ROWTYPE;
  v_recipe public.product_recipes%ROWTYPE;
  v_line record;
  v_needed numeric;
  v_cost numeric := 0;
  v_short text[] := '{}';
BEGIN
  SELECT * INTO v_run FROM public.production_runs WHERE id = p_run_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Production run not found');
  END IF;
  IF v_run.status = 'completed' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'This run has already been completed');
  END IF;
  IF v_run.status = 'cancelled' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'This run was cancelled');
  END IF;

  SELECT * INTO v_recipe FROM public.product_recipes WHERE id = v_run.recipe_id;

  FOR v_line IN
    SELECT rl.material_item_id, rl.quantity_per_unit, rl.scrap_allowance_pct, i.name, i.quantity AS in_stock, i.unit_price
    FROM public.recipe_lines rl
    JOIN public.inventory_items i ON i.id = rl.material_item_id
    WHERE rl.recipe_id = v_run.recipe_id
  LOOP
    v_needed := ceil(v_line.quantity_per_unit * v_run.planned_quantity * (1 + v_line.scrap_allowance_pct / 100.0));
    IF v_line.in_stock < v_needed THEN
      v_short := array_append(v_short, format('%s (need %s, have %s)', v_line.name, v_needed, v_line.in_stock));
    END IF;
  END LOOP;

  IF array_length(v_short, 1) > 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not enough raw materials: ' || array_to_string(v_short, '; '));
  END IF;

  -- Deduct materials, log movements, record consumption
  FOR v_line IN
    SELECT rl.material_item_id, rl.quantity_per_unit, rl.scrap_allowance_pct, i.name, i.unit_price
    FROM public.recipe_lines rl
    JOIN public.inventory_items i ON i.id = rl.material_item_id
    WHERE rl.recipe_id = v_run.recipe_id
  LOOP
    v_needed := ceil(v_line.quantity_per_unit * v_run.planned_quantity * (1 + v_line.scrap_allowance_pct / 100.0));
    v_cost := v_cost + v_needed * coalesce(v_line.unit_price, 0);

    UPDATE public.inventory_items
      SET quantity = quantity - v_needed
      WHERE id = v_line.material_item_id;

    INSERT INTO public.stock_movements (user_id, inventory_item_id, movement_type, quantity, from_location, project_id, notes, created_by)
    VALUES (v_run.user_id, v_line.material_item_id, 'outgoing', v_needed::int, v_run.location, v_run.project_id,
            'Production run: ' || v_recipe.recipe_name, auth.uid());

    INSERT INTO public.production_consumptions (run_id, inventory_item_id, planned_quantity, actual_quantity, unit_cost)
    VALUES (v_run.id, v_line.material_item_id, v_line.quantity_per_unit * v_run.planned_quantity, v_needed, coalesce(v_line.unit_price, 0));
  END LOOP;

  -- Add finished goods
  UPDATE public.inventory_items
    SET quantity = quantity + v_run.planned_quantity
    WHERE id = v_recipe.product_item_id;

  INSERT INTO public.stock_movements (user_id, inventory_item_id, movement_type, quantity, to_location, project_id, notes, created_by)
  VALUES (v_run.user_id, v_recipe.product_item_id, 'incoming', v_run.planned_quantity, v_run.location, v_run.project_id,
          'Production run output: ' || v_recipe.recipe_name, auth.uid());

  UPDATE public.production_runs
    SET status = 'completed', produced_quantity = planned_quantity,
        started_at = coalesce(started_at, now()), completed_at = now(),
        actual_material_cost = v_cost, updated_at = now()
    WHERE id = v_run.id;

  RETURN jsonb_build_object('ok', true, 'material_cost', v_cost, 'produced', v_run.planned_quantity);
END;
$$;

REVOKE ALL ON FUNCTION public.run_production(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.run_production(uuid) TO authenticated;

-- ============ Requisition approval = auto stock-out ============
CREATE OR REPLACE FUNCTION public.issue_requisition(p_requisition_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req public.requisitions%ROWTYPE;
  v_item record;
  v_short text[] := '{}';
BEGIN
  SELECT * INTO v_req FROM public.requisitions WHERE id = p_requisition_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Requisition not found');
  END IF;
  IF v_req.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Only pending requisitions can be issued');
  END IF;

  FOR v_item IN
    SELECT ri.inventory_item_id, ri.quantity, i.name, i.quantity AS in_stock
    FROM public.requisition_items ri
    JOIN public.inventory_items i ON i.id = ri.inventory_item_id
    WHERE ri.requisition_id = p_requisition_id
  LOOP
    IF v_item.in_stock < v_item.quantity THEN
      v_short := array_append(v_short, format('%s (need %s, have %s)', v_item.name, v_item.quantity, v_item.in_stock));
    END IF;
  END LOOP;

  IF array_length(v_short, 1) > 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not enough stock: ' || array_to_string(v_short, '; '));
  END IF;

  FOR v_item IN
    SELECT ri.inventory_item_id, ri.quantity
    FROM public.requisition_items ri
    WHERE ri.requisition_id = p_requisition_id
  LOOP
    UPDATE public.inventory_items
      SET quantity = quantity - v_item.quantity
      WHERE id = v_item.inventory_item_id;

    UPDATE public.requisition_items
      SET quantity_issued = v_item.quantity
      WHERE requisition_id = p_requisition_id AND inventory_item_id = v_item.inventory_item_id;

    INSERT INTO public.stock_movements (user_id, inventory_item_id, movement_type, quantity, project_id, notes, created_by)
    VALUES (v_req.user_id, v_item.inventory_item_id, 'outgoing', v_item.quantity, v_req.project_id,
            'Requisition issued to ' || v_req.requested_by_name, auth.uid());
  END LOOP;

  UPDATE public.requisitions
    SET status = 'issued', approved_by = auth.uid(), issued_at = now(), updated_at = now()
    WHERE id = p_requisition_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.issue_requisition(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.issue_requisition(uuid) TO authenticated;
