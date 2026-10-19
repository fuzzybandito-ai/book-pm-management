/**
 * Date helpers for the dashboard. All comparisons are local-date based so a
 * streak that crosses midnight in the user's timezone is counted correctly.
 */

/** Local YYYY-MM-DD for a Date or ISO string. */
export function dayKey(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
}

/** Today's local YYYY-MM-DD. */
export function todayKey() {
  return dayKey(new Date());
}

/** Date object for the start of the local week (Monday). */
export function startOfWeek(d = new Date()) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7; // days since Monday
  date.setDate(date.getDate() - diff);
  return date;
}

/** Array of 7 local YYYY-MM-DD keys for the current week (Mon..Sun). */
export function currentWeekDays() {
  const start = startOfWeek();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return dayKey(d);
  });
}

/**
 * Current streak: consecutive days (ending today or yesterday) with at least
 * one workout. If today has a workout, count starts at today. If today has
 * none but yesterday does, the streak still holds (yesterday is the latest
 * day). A day with no workout breaks the streak.
 */
export function currentStreak(workouts) {
  const daysWithWorkouts = new Set(workouts.map((w) => dayKey(w.completed_at)));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // If today has no workout, start from yesterday so the streak isn't lost
  // before the day is over.
  if (!daysWithWorkouts.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daysWithWorkouts.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Count of workouts whose local day falls within the current week (Mon..Sun). */
export function workoutsThisWeek(workouts) {
  const week = new Set(currentWeekDays());
  return workouts.filter((w) => week.has(dayKey(w.completed_at))).length;
}

/** Short weekday labels for the current week, Mon..Sun. */
export function weekdayLabels() {
  const start = startOfWeek();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });
}
