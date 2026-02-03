-- Add expiry_date column to inventory_items
ALTER TABLE public.inventory_items 
ADD COLUMN expiry_date date DEFAULT NULL;

-- Create activity_logs table for staff action tracking
CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_name text,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity_type ON public.activity_logs(entity_type);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view activity logs for their organization (managers/admins only)
CREATE POLICY "Managers can view activity logs"
ON public.activity_logs
FOR SELECT
USING (is_manager_or_admin(auth.uid()));

-- Users can insert their own activity logs
CREATE POLICY "Users can insert own activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Comment for documentation
COMMENT ON TABLE public.activity_logs IS 'Tracks all user actions for audit trail and theft prevention';
COMMENT ON COLUMN public.activity_logs.action_type IS 'Type of action: create, update, delete, view, scan, transfer';
COMMENT ON COLUMN public.activity_logs.entity_type IS 'Type of entity: inventory_item, stock_movement, purchase_order, etc';
COMMENT ON COLUMN public.inventory_items.expiry_date IS 'Expiry date for perishable items';