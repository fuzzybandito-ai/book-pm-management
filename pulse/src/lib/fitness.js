/**
 * Date + streak helpers for the fitness dashboard.
 * All math is local-date based, not 24h-rolling, so a workout at 11pm and
 * another at 6am the next day count as two separate days for streak purposes.
 */

/** 'YYYY-MM-DD' for a Date in local time. */
export function dateKey(d) {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${da}`;
}

/** Local YYYY-MM-DD from an ISO timestamp string. */
export function isoDateKey(iso) {
  return dateKey(new Date(iso));
}

/** Today's local YYYY-MM-DD. */
export function todayKey() {
  return dateKey(new Date());
}

/**
 * Current streak: consecutive calendar days (ending today or yesterday)
 * with at least one workout. If today has a workout, the streak includes
 * today. If today has none but yesterday does, the streak still stands
 * (so a user who logs in the morning keeps their streak from yesterday).
 */
export function currentStreak(workouts) {
  if (!workouts.length) return 0;
  const days = new Set(workouts.map((w) => isoDateKey(w.completed_at)));
  let streak = 0;
  const cursor = new Date();
  // If today has no workout, start from yesterday so the streak doesn't break
  // before the day is over.
  if (!days.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Total number of workouts. */
export function totalWorkouts(workouts) {
  return workouts.length;
}

/**
 * Workouts logged in the current calendar week (Mon–Sun).
 */
export function weeklyWorkouts(workouts) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun .. 6=Sat
  // Monday as the first day of the week.
  const offsetToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - offsetToMonday);
  monday.setHours(0, 0, 0, 0);
  const startKey = dateKey(monday);
  return workouts.filter((w) => {
    const wk = isoDateKey(w.completed_at);
    return wk >= startKey;
  }).length;
}

/**
 * Last 7 calendar days of counts for the weekly trend chart.
 * Returns [{ date: 'Mon D', value: count }, ...] oldest -> newest.
 */
export function weeklyTrend(workouts) {
  const byDay = {};
  workouts.forEach((w) => {
    const k = isoDateKey(w.completed_at);
    byDay[k] = (byDay[k] || 0) + 1;
  });
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dateKey(d);
    out.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      value: byDay[k] || 0,
    });
  }
  return out;
}
