/*
# York U Fitness — add target_days to goals

1. Purpose
   The goals table already stores a user's fitness goal text and active flag.
   This adds an optional weekly target (workout days per week) so the
   dashboard can show weekly progress against a user-defined goal.

2. Modified Tables
   goals
   - target_days integer, NOT NULL, default 3, CHECK (0..7)
     Added via DO block so the migration is idempotent (safe to re-run).
     Existing goal rows back-fill to the default of 3 days/week.

3. Security
   No policy changes. Existing owner-scoped RLS on goals already covers the
   new column — authenticated users can read/write their own row only.

4. Important notes
   - Additive only: no columns dropped, no types changed, no data lost.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'target_days'
  ) THEN
    ALTER TABLE goals ADD COLUMN target_days integer NOT NULL DEFAULT 3;
    ALTER TABLE goals ADD CONSTRAINT goals_target_days_range CHECK (target_days >= 0 AND target_days <= 7);
  END IF;
END $$;