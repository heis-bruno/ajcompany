-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
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

-- Policy: authenticated users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: admins can manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create clients table
CREATE TABLE public.clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    email text,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage clients"
ON public.clients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create payments table
CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    due_date date NOT NULL,
    amount numeric NOT NULL,
    currency text DEFAULT 'USD',
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID')),
    reminder_count integer DEFAULT 0,
    last_notification_sent_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage payments"
ON public.payments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create admin_devices table for FCM tokens
CREATE TABLE public.admin_devices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    fcm_token text NOT NULL UNIQUE,
    device_type text DEFAULT 'android',
    device_name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.admin_devices ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage their own devices
CREATE POLICY "Admins can manage own devices"
ON public.admin_devices
FOR ALL
TO authenticated
USING (auth.uid() = admin_id AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = admin_id AND public.has_role(auth.uid(), 'admin'));

-- Create notification_logs table for tracking sent notifications
CREATE TABLE public.notification_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id uuid REFERENCES public.payments(id) ON DELETE CASCADE,
    device_id uuid REFERENCES public.admin_devices(id) ON DELETE SET NULL,
    notification_type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    status text DEFAULT 'pending',
    error_message text,
    sent_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view notification logs"
ON public.notification_logs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service can insert notification logs"
ON public.notification_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_devices_updated_at
BEFORE UPDATE ON public.admin_devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();