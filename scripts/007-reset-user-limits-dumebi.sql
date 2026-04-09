-- Reset generation limits for testing user (okolodumebi@gmail.com)
-- User ID: 9b0cb5a9-9e17-48f4-b148-12527222ffb8

-- Reset all generation counters to 0
UPDATE user_stats
SET 
  campaigns_generated = 0,
  image_generations_this_month = 0,
  email_sends_this_month = 0,
  updated_at = NOW()
WHERE user_id = '9b0cb5a9-9e17-48f4-b148-12527222ffb8';

-- Optionally: Extend trial if needed (uncomment if you want to extend trial)
-- UPDATE profiles
-- SET 
--   trial_ends_at = NOW() + INTERVAL '7 days',
--   updated_at = NOW()
-- WHERE id = '9b0cb5a9-9e17-48f4-b148-12527222ffb8';

-- Verify the reset
SELECT 
  user_id,
  campaigns_generated,
  image_generations_this_month,
  email_sends_this_month,
  generation_reset_at
FROM user_stats
WHERE user_id = '9b0cb5a9-9e17-48f4-b148-12527222ffb8';
