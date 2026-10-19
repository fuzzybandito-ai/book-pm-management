import { useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabaseClient';

/**
 * useWorkouts — owner-scoped workouts from Supabase.
 * Exposes { workouts, loading, error, add, update, remove }.
 *
 * All access is RLS-scoped server-side; the client never sees another user's
 * rows. Workouts are ordered by completed_at descending.
 */
export default function useWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('completed_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setWorkouts(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (workout) => {
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        activity: workout.activity,
        kind: workout.kind,
        duration_min: workout.durationMin ?? null,
        intensity: workout.intensity ?? null,
        note: workout.note ?? null,
        completed_at: workout.completedAt,
      })
      .select()
      .single();
    if (error) return { error };
    setWorkouts((prev) =>
      [...prev, data].sort(
        (a, b) => new Date(b.completed_at) - new Date(a.completed_at)
      )
    );
    return { workout: data };
  }, []);

  const update = useCallback(async (id, changes) => {
    const payload = {};
    if (changes.activity !== undefined) payload.activity = changes.activity;
    if (changes.kind !== undefined) payload.kind = changes.kind;
    if (changes.durationMin !== undefined) payload.duration_min = changes.durationMin;
    if (changes.intensity !== undefined) payload.intensity = changes.intensity;
    if (changes.note !== undefined) payload.note = changes.note;
    if (changes.completedAt !== undefined) payload.completed_at = changes.completedAt;

    const { data, error } = await supabase
      .from('workouts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) return { error };
    setWorkouts((prev) =>
      [...prev.map((w) => (w.id === id ? data : w))].sort(
        (a, b) => new Date(b.completed_at) - new Date(a.completed_at)
      )
    );
    return { workout: data };
  }, []);

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id);
    if (error) return { error };
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    return {};
  }, []);

  return { workouts, loading, error, add, update, remove, reload: load };
}
