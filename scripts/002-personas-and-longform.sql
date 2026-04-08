-- Migration: Add persona marketplace schema
-- Purpose: Store custom personas created by users from the marketplace

CREATE TABLE IF NOT EXISTS public.user_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_name TEXT NOT NULL,
  voice_text TEXT NOT NULL,
  is_marketplace_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.user_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own personas"
  ON public.user_personas
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create personas"
  ON public.user_personas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personas"
  ON public.user_personas
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personas"
  ON public.user_personas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_user_personas_user_id ON public.user_personas(user_id);
CREATE INDEX idx_user_personas_marketplace_default ON public.user_personas(is_marketplace_default);

-- Migration: Add long-form content tracking to posts table
-- Purpose: Track which posts were generated using long-form feature (Org/Enterprise only)

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_longform BOOLEAN DEFAULT FALSE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS longform_sections JSONB;
