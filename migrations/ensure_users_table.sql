-- 1) Ensure the table exists (if it already does, this will just error and you can skip)
-- CREATE TABLE public.users (id uuid PRIMARY KEY);

-- 2) Make sure required columns exist
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS permissions text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS customer_id text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- 3) Make id the primary key and link it to auth.users(id)
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_pkey,
  ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Foreign key to Supabase Auth users table
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_auth_user_fk,
  ADD CONSTRAINT users_auth_user_fk
    FOREIGN KEY (id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE;

-- 4) Constraints on role and status
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check,
  ADD CONSTRAINT users_role_check
    CHECK (role IN ('admin', 'staff', 'user', 'customer'));

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_status_check,
  ADD CONSTRAINT users_status_check
    CHECK (status IN ('active', 'suspended'));

-- 5) Email must be unique + not null
ALTER TABLE public.users
  ALTER COLUMN email SET NOT NULL;

-- Ensure a unique index on email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'users_email_key'
  ) THEN
    CREATE UNIQUE INDEX users_email_key
      ON public.users (email);
  END IF;
END $$;

-- 6) Helpful indexes
CREATE INDEX IF NOT EXISTS users_email_idx  ON public.users (email);
CREATE INDEX IF NOT EXISTS users_role_idx   ON public.users (role);
CREATE INDEX IF NOT EXISTS users_status_idx ON public.users (status);

-- 7) Default permissions for customers
ALTER TABLE public.users
  ALTER COLUMN permissions
  SET DEFAULT ARRAY['view_menu', 'place_order', 'view_order_history']::text[];
