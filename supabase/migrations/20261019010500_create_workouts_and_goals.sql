/*
# York U Fitness — workouts, goals, and weekly progress

1. Purpose
This migration creates the data layer for the York U Fitness progress dashboard.
Students sign in with email/password, set one active fitness goal, log workouts
(solo or group classes — multiple per day allowed), and see their streak and
weekly progress. Each user can only ever read or modify their own rows; this is
enforced at the database by Row Level Security, not just in the UI.

2. New Tables

- `goals`
  - `id`          uuid primary key
  - `user_id`     uuid, NOT NULL, defaults to the signed-in user (auth.uid()),
                  foreign key to auth.users with CASCADE on delete
  - `text`        text, NOT NULL — the goal description (e.g. "Work out 3x/week")
  - `is_active`   boolean, default true — only one active goal is honored by the
                  app per user; setting a new active goal retires prior ones
  - `created_at`  timestamptz, default now()
  - A partial unique index ensures at most one active goal per user.

- `workouts`
  - `id`          uuid primary key
  - `user_id`     uuid, NOT NULL, defaults to the signed-in user (auth.uid()),
                  foreign key to auth.users with CASCADE on delete
  - `activity`    text, NOT NULL — e.g. "Treadmill run", "Yoga class"
  - `kind`        text, NOT NULL, CHECK in ('solo','group') — solo workout or
                  campus group class
  - `duration_min` integer, nullable — optional duration in minutes
  - `intensity`   text, nullable, CHECK in ('easy','moderate','hard')
  - `note`        text, nullable — free-text note
  - `completed_at` timestamptz, NOT NULL, default now() — when the workout was
                  done. Multiple workouts on the same day are allowed (no unique
                  constraint on (user_id, date)).
  - `created_at`  timestamptz, default now()
  - Index on (user_id, completed_at desc) for dashboard/history queries.

3. Security
- RLS enabled on both tables.
- Four owner-scoped policies (SELECT/INSERT/UPDATE/DELETE) on each table,
  scoped TO authenticated with auth.uid() = user_id. No anon access — the app
  requires sign-in.
- user_id columns default to auth.uid() so frontend inserts that omit user_id
  still satisfy the INSERT WITH CHECK.
4. Notes
- No destructive operations. Tables are created IF NOT EXISTS and policies are
  dropped-then-created so the migration is safe to re-run.
*/

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- At most one active goal per user.
CREATE UNIQUE INDEX IF NOT EXISTS goals_one_active_per_user
  ON goals (user_id)
  WHERE is_active;

DROP POLICY IF EXISTS "select_own_goals" ON goals;
CREATE POLICY "select_own_goals" ON goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_goals" ON goals;
CREATE POLICY "insert_own_goals" ON goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_goals" ON goals;
CREATE POLICY "update_own_goals" ON goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_goals" ON goals;
CREATE POLICY "delete_own_goals" ON goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  activity text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('solo','group')),
  duration_min integer,
  intensity text CHECK (intensity IS NULL OR intensity IN ('easy','moderate','hard')),
  note text,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS workouts_user_completed_idx
  ON workouts (user_id, completed_at DESC);

DROP POLICY IF EXISTS "select_own_workouts" ON workouts;
CREATE POLICY "select_own_workouts" ON workouts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_workouts" ON workouts;
CREATE POLICY "insert_own_workouts" ON workouts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_workouts" ON workouts;
CREATE POLICY "update_own_workouts" ON workouts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_workouts" ON workouts;
CREATE POLICY "delete_own_workouts" ON workouts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
