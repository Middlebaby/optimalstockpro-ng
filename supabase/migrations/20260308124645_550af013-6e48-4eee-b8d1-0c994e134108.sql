
-- Distribution Locations (retailers/outlets)
CREATE TABLE public.distribution_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.distribution_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own locations" ON public.distribution_locations
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Production Batches
CREATE TABLE public.production_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  batch_number TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity_produced INTEGER NOT NULL DEFAULT 0,
  quantity_remaining INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own batches" ON public.production_batches
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Distributions (stock sent to locations)
CREATE TABLE public.distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location_id UUID NOT NULL REFERENCES public.distribution_locations(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  amount_due NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  distributed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own distributions" ON public.distributions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Distribution Sales (daily sales per location)
CREATE TABLE public.distribution_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location_id UUID NOT NULL REFERENCES public.distribution_locations(id) ON DELETE CASCADE,
  distribution_id UUID REFERENCES public.distributions(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  units_sold INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  returns INTEGER DEFAULT 0,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.distribution_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sales" ON public.distribution_sales
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_distribution_locations_updated_at BEFORE UPDATE ON public.distribution_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_batches_updated_at BEFORE UPDATE ON public.production_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
