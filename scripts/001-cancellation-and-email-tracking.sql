-- Migration 001: Add welcome email tracking columns to users table
-- Purpose: Track which users have received welcome emails and which plan they upgraded to

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS welcome_email_plan TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for email tracking queries to improve performance on webhook processing
CREATE INDEX IF NOT EXISTS idx_users_welcome_email_sent ON public.users(welcome_email_sent);
CREATE INDEX IF NOT EXISTS idx_users_welcome_email_plan ON public.users(welcome_email_plan);
