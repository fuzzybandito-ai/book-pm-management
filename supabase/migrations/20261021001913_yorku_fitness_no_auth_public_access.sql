/*
# York U Fitness — remove login requirement (switch to public/shared access)

1. Purpose
   The app no longer has a sign-in screen. It is now a shared, single-tenant
   tracker where anyone using the app reads and writes the same workouts and
   the same single goal. This migration drops the per-user ownership model
   (user_id foreign keys + owner-scoped RLS) and replaces it with public
   anon+authenticated CRUD policies so the anon-key frontend can operate
   without any signed-in user.

2. Modified Tables
   workouts
   - user_id is now nullable (anon inserts have no user). The column itself is
     kept so existing rows are not disturbed; new rows simply leave it null.
   - The workouts_user_id_fkey foreign key to auth.users is dropped, because
     anon inserts would otherwise require a matching auth.users row.
   goals
   - user_id is now nullable for the same reason.
   - The goals_user_id_fkey foreign key to auth.users is dropped.
   - The UNIQUE constraint on user_id (if present) is dropped so more than one
     goal row can exist without a user_id.

3. Security
   - RLS stays ENABLED on both tables.
   - All eight existing owner-scoped policies (select/insert/update/delete on
     each table, scoped TO authenticated with auth.uid() = user_id) are
     dropped and replaced with four public policies per table (one per CRUD
     verb), scoped TO anon, authenticated with USING (true) / WITH CHECK (true).
     This is the documented single-tenant pattern: the data is intentionally
     shared, so (true) predicates are correct here.

4. Important notes
   - No columns are dropped and no data is deleted; existing rows keep their
     user_id values. The change is additive: the columns just become optional
     and the access model broadens.
   - Safe to re-run: every DROP is guarded with IF EXISTS.
*/

-- workouts: relax ownership model
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_user_id_fkey;
ALTER TABLE workouts ALTER COLUMN user_id DROP NOT NULL;

-- goals: relax ownership model
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_user_id_fkey;
ALTER TABLE goals ALTER COLUMN user_id DROP NOT NULL;
-- Drop the per-user uniqueness constraint if it exists so multiple shared
-- goal rows are allowed (the frontend now upserts on the single shared row).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'goals' AND indexname = 'goals_user_id_key'
  ) THEN
    ALTER TABLE goals DROP CONSTRAINT goals_user_id_key;
  END IF;
END $$;

-- workouts: replace owner-scoped policies with public shared-data policies
DROP POLICY IF EXISTS "select_own_workouts" ON workouts;
DROP POLICY IF EXISTS "insert_own_workouts" ON workouts;
DROP POLICY IF EXISTS "update_own_workouts" ON workouts;
DROP POLICY IF EXISTS "delete_own_workouts" ON workouts;

CREATE POLICY "anon_select_workouts"
ON workouts FOR SELECT
TO anon, authenticated USING (true);

CREATE POLICY "anon_insert_workouts"
ON workouts FOR INSERT
TO anon, authenticated WITH CHECK (true);

CREATE POLICY "anon_update_workouts"
ON workouts FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_workouts"
ON workouts FOR DELETE
TO anon, authenticated USING (true);

-- goals: replace owner-scoped policies with public shared-data policies
DROP POLICY IF EXISTS "select_own_goals" ON goals;
DROP POLICY IF EXISTS "insert_own_goals" ON goals;
DROP POLICY IF EXISTS "update_own_goals" ON goals;
DROP POLICY IF EXISTS "delete_own_goals" ON goals;

CREATE POLICY "anon_select_goals"
ON goals FOR SELECT
TO anon, authenticated USING (true);

CREATE POLICY "anon_insert_goals"
ON goals FOR INSERT
TO anon, authenticated WITH CHECK (true);

CREATE POLICY "anon_update_goals"
ON goals FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_goals"
ON goals FOR DELETE
TO anon, authenticated USING (true);