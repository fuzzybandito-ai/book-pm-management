import { useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabaseClient';
import { useAuth } from './useAuth';

/**
 * Data hook for York U Fitness.
 * Reads and writes the signed-in user's workouts and active goal through
 * Supabase. RLS guarantees every row returned belongs to the current user.
 */
export default function useFitnessData() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    if (!user) {
      setWorkouts([]);
      setGoal(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [wRes, gRes] = await Promise.all([
        supabase
          .from('workouts')
          .select('*')
          .order('completed_at', { ascending: false }),
        supabase
          .from('goals')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (wRes.error) throw wRes.error;
      if (gRes.error) throw gRes.error;
      setWorkouts(wRes.data ?? []);
      setGoal(gRes.data ?? null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /** Insert a workout. Returns { data, error }. */
  const addWorkout = useCallback(async (entry) => {
    const payload = {
      activity: entry.activity,
      kind: entry.kind,
      duration_min: entry.duration_min ?? null,
      intensity: entry.intensity ?? null,
      note: entry.note ?? null,
      completed_at: entry.completed_at || new Date().toISOString(),
    };
    const { data, error } = await supabase.from('workouts').insert(payload).select().single();
    if (!error) setWorkouts((prev) => [data, ...prev]);
    return { data, error };
  }, []);

  /** Update a workout by id. Returns { data, error }. */
  const updateWorkout = useCallback(async (id, changes) => {
    const { data, error } = await supabase.from('workouts').update(changes).eq('id', id).select().single();
    if (!error) setWorkouts((prev) => prev.map((w) => (w.id === id ? data : w)));
    return { data, error };
  }, []);

  /** Delete a workout by id. Returns { error }. */
  const removeWorkout = useCallback(async (id) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id);
    if (!error) setWorkouts((prev) => prev.filter((w) => w.id !== id));
    return { error };
  }, []);

  /** Set an active goal. Retires any existing active goal for this user. */
  const setGoalText = useCallback(async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return { error: { message: 'Goal cannot be empty.' } };
    // Retire existing active goals, then insert the new one.
    const { error: retireErr } = await supabase
      .from('goals')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true);
    if (retireErr) return { error: retireErr };
    const { data, error } = await supabase
      .from('goals')
      .insert({ text: trimmed, is_active: true })
      .select()
      .single();
    if (!error) setGoal(data);
    return { data, error };
  }, [user]);

  /** Clear the active goal (retire it). */
  const clearGoal = useCallback(async () => {
    if (!goal) return { error: null };
    const { error } = await supabase
      .from('goals')
      .update({ is_active: false })
      .eq('id', goal.id);
    if (!error) setGoal(null);
    return { error };
  }, [goal]);

  return {
    workouts,
    goal,
    loading,
    error,
    reload: loadAll,
    addWorkout,
    updateWorkout,
    removeWorkout,
    setGoalText,
    clearGoal,
  };
}
