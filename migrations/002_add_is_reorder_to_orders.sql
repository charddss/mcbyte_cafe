-- Add is_reorder flag to orders so we can mark reorders without mixing with active cart
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS is_reorder boolean DEFAULT false;

-- Helpful index for queries that filter by the flag
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_orders_is_reorder'
  ) THEN
    CREATE INDEX idx_orders_is_reorder ON public.orders (is_reorder);
  END IF;
END $$;
