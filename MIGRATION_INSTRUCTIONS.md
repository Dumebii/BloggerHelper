# Database Migration Instructions

## Phase 1: Subscription Cancellation & Email Tracking

### File: `scripts/001-cancellation-and-email-tracking.sql`

**To run this migration:**

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor** → **New Query**
3. Copy the entire contents of `scripts/001-cancellation-and-email-tracking.sql`
4. Paste into the query editor
5. Click **Run**

**What this does:**
- Creates `cancellation_requests` table to track why users cancel, when they cancel, and if they reactivate
- Adds `welcome_email_sent`, `welcome_email_plan`, and `welcome_email_sent_at` columns to `users` table
- Enables Row Level Security (RLS) so users can only see their own records
- Creates indexes for faster queries on common filters

---

## Phase 2: Personas & Long-Form Content

### File: `scripts/002-personas-and-longform.sql`

**To run this migration:**

1. Go to Supabase SQL Editor
2. Copy the entire contents of `scripts/002-personas-and-longform.sql`
3. Paste into the query editor
4. Click **Run**

**What this does:**
- Creates `user_personas` table for storing custom personas from the marketplace
- Each persona stores the name and the voice description that shapes the output
- Tracks which personas are defaults from the marketplace
- Adds `is_longform` and `longform_sections` to `posts` table to track long-form generated content
- Enables RLS so users can only manage their own personas

---

## Migration Order

Run them in this order:
1. `001-cancellation-and-email-tracking.sql` first (foundational for Phase 1)
2. `002-personas-and-longform.sql` next (needed for Phase 2 & 3)

Both migrations are idempotent - they use `IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`, so they're safe to re-run if needed.

---

## Verification

After running each migration, verify by:

1. **Check `cancellation_requests` table:**
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'cancellation_requests';
   ```

2. **Check `user_personas` table:**
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'user_personas';
   ```

3. **Check new columns on `users` table:**
   ```sql
   SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name LIKE 'welcome_email%';
   ```

All queries should return results if migrations were successful.
