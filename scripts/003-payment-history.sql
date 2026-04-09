-- Migration 003: Payment history tracking for compliance
-- Purpose: Track all payments/invoices for user billing history display

CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL UNIQUE,
  subscription_id TEXT,
  plan TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'succeeded' CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  payment_method TEXT,
  receipt_email_sent BOOLEAN DEFAULT FALSE,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_date ON public.payment_history(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(status);

-- Enable RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own payment history
CREATE POLICY "Users can view their own payment history"
  ON public.payment_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Note: Only service role can INSERT/UPDATE payment records (from webhook)
