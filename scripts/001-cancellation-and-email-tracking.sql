-- Migration: Create subscription cancellation request tracking
-- Purpose: Track user cancellation requests, reasons, and status for compliance and analysis

CREATE TABLE IF NOT EXISTS public.cancellation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL,
  plan_before TEXT NOT NULL,
  cancellation_reason TEXT,
  feedback TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'reactivated')),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  reactivated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subscription_id)
);

-- Add RLS policies
ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cancellation requests"
  ON public.cancellation_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cancellation requests"
  ON public.cancellation_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cancellation requests"
  ON public.cancellation_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_cancellation_requests_user_id ON public.cancellation_requests(user_id);
CREATE INDEX idx_cancellation_requests_subscription_id ON public.cancellation_requests(subscription_id);
CREATE INDEX idx_cancellation_requests_status ON public.cancellation_requests(status);

-- Migration: Add email tracking to users table
-- Purpose: Track whether welcome emails have been sent for plan upgrades

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS welcome_email_plan TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for email tracking queries
CREATE INDEX IF NOT EXISTS idx_users_welcome_email_sent ON public.users(welcome_email_sent);
