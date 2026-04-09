
-- Sales channels table
CREATE TABLE public.sales_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel_name TEXT NOT NULL,
  channel_type TEXT NOT NULL DEFAULT 'manual',
  is_active BOOLEAN NOT NULL DEFAULT true,
  api_config JSONB DEFAULT '{}'::jsonb,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own channels"
  ON public.sales_channels FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_sales_channels_updated_at
  BEFORE UPDATE ON public.sales_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Location inventory table (stock per item per location)
CREATE TABLE public.location_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.distribution_locations(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(inventory_item_id, location_id)
);

ALTER TABLE public.location_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own location inventory"
  ON public.location_inventory FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_location_inventory_updated_at
  BEFORE UPDATE ON public.location_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add channel_id to distribution_sales for tracking which channel a sale came from
ALTER TABLE public.distribution_sales
  ADD COLUMN channel_id UUID REFERENCES public.sales_channels(id);
