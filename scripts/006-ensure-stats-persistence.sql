-- Migration 006: Ensure stats persistence and fix any missing columns
-- Purpose: Make sure user_stats table has all required columns and proper triggers

-- Ensure campaigns_generated column exists
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS campaigns_generated INTEGER DEFAULT 0;

-- Ensure the RPC function exists for incrementing campaigns
CREATE OR REPLACE FUNCTION public.increment_campaigns_generated(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, campaigns_generated)
  VALUES (user_id_param, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET campaigns_generated = user_stats.campaigns_generated + 1;
END;
$$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- Ensure scheduled_posts has proper indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_status ON public.scheduled_posts(user_id, status);

-- Enable realtime for user_stats (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_posts;
