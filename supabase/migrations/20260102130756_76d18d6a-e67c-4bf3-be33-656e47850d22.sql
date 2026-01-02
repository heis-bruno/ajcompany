-- Create table for SMTP and email settings (admin configurable)
CREATE TABLE public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host TEXT NOT NULL DEFAULT 'smtp.gmail.com',
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_username TEXT,
  smtp_password TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT DEFAULT 'AJ Company',
  reminder_days_before INTEGER DEFAULT 3,
  max_overdue_reminders INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for loans with reminder tracking
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_name TEXT NOT NULL,
  borrower_email TEXT,
  borrower_phone TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL DEFAULT 0,
  interest_type TEXT NOT NULL DEFAULT 'fixed',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'active',
  late_fee NUMERIC DEFAULT 0,
  notes TEXT,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  reminders_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for ticket/visa records
CREATE TABLE public.ticket_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name TEXT NOT NULL,
  ticket_number TEXT,
  visa_destination TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  money_paid NUMERIC NOT NULL DEFAULT 0,
  service_fee NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC GENERATED ALWAYS AS (money_paid + service_fee) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for email reminder logs
CREATE TABLE public.email_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_reminder_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admin access)
CREATE POLICY "Allow authenticated users full access to email_settings"
ON public.email_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to loans"
ON public.loans FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to ticket_records"
ON public.ticket_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to email_reminder_logs"
ON public.email_reminder_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default email settings row
INSERT INTO public.email_settings (from_email, from_name) VALUES ('noreply@ajcompany.com', 'AJ Company');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_email_settings_updated_at
  BEFORE UPDATE ON public.email_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_records_updated_at
  BEFORE UPDATE ON public.ticket_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();