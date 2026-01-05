
-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'staff');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is manager or admin
CREATE OR REPLACE FUNCTION public.is_manager_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'manager')
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create suppliers table
CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suppliers"
ON public.suppliers FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suppliers"
ON public.suppliers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppliers"
ON public.suppliers FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppliers"
ON public.suppliers FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Create projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
ON public.projects FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
ON public.projects FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
ON public.projects FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
ON public.projects FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Create equipment table
CREATE TABLE public.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    serial_number TEXT,
    status TEXT DEFAULT 'available',
    location TEXT,
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own equipment"
ON public.equipment FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment"
ON public.equipment FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment"
ON public.equipment FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment"
ON public.equipment FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Create inventory_items table
CREATE TABLE public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    description TEXT,
    category TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'pcs',
    unit_price DECIMAL(12,2),
    reorder_level INTEGER DEFAULT 10,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    location TEXT,
    photo_url TEXT,
    is_logged BOOLEAN DEFAULT false,
    logged_at TIMESTAMP WITH TIME ZONE,
    logged_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
ON public.inventory_items FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory"
ON public.inventory_items FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only managers/admins can update logged items
CREATE POLICY "Users can update own inventory"
ON public.inventory_items FOR UPDATE TO authenticated
USING (
    auth.uid() = user_id AND (
        is_logged = false OR 
        public.is_manager_or_admin(auth.uid())
    )
);

CREATE POLICY "Users can delete own inventory"
ON public.inventory_items FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    order_number TEXT NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    total_amount DECIMAL(12,2),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchase orders"
ON public.purchase_orders FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchase orders"
ON public.purchase_orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchase orders"
ON public.purchase_orders FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own purchase orders"
ON public.purchase_orders FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own PO items"
ON public.purchase_order_items FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.purchase_orders po 
        WHERE po.id = purchase_order_id AND po.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own PO items"
ON public.purchase_order_items FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.purchase_orders po 
        WHERE po.id = purchase_order_id AND po.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own PO items"
ON public.purchase_order_items FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.purchase_orders po 
        WHERE po.id = purchase_order_id AND po.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own PO items"
ON public.purchase_order_items FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.purchase_orders po 
        WHERE po.id = purchase_order_id AND po.user_id = auth.uid()
    )
);

-- Create stock_movements table for tracking
CREATE TABLE public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
    movement_type TEXT NOT NULL, -- 'in', 'out', 'transfer', 'adjustment'
    quantity INTEGER NOT NULL,
    from_location TEXT,
    to_location TEXT,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stock movements"
ON public.stock_movements FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stock movements"
ON public.stock_movements FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create notification_settings table
CREATE TABLE public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    whatsapp_notifications BOOLEAN DEFAULT false,
    whatsapp_number TEXT,
    weekly_summary BOOLEAN DEFAULT true,
    low_stock_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification settings"
ON public.notification_settings FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
ON public.notification_settings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
ON public.notification_settings FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
BEFORE UPDATE ON public.equipment
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('inventory-photos', 'inventory-photos', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'inventory-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'inventory-photos');

CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'inventory-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'inventory-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger to auto-assign staff role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'staff');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
