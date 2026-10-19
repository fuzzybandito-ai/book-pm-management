import { useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabaseClient';

/**
 * useGoal — a user's single active fitness goal (one row per user).
 * Exposes { goal, loading, error, upsert, remove }.
 *
 * The goals table enforces one row per user (UNIQUE on user_id). `upsert`
 * creates or updates that single row. RLS guarantees a user only sees their
 * own goal.
 */
export default function useGoal() {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .maybeSingle();
    if (error) {
      setError(error.message);
    } else {
      setGoal(data);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upsert = useCallback(async (values) => {
    const payload = {
      text: values.text,
      is_active: values.isActive ?? true,
      target_days: values.targetDays ?? 3,
    };
    const { data, error } = await supabase
      .from('goals')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .maybeSingle();
    if (error) return { error };
    setGoal(data);
    return { goal: data };
  }, []);

  const remove = useCallback(async () => {
    const { error } = await supabase.from('goals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) return { error };
    setGoal(null);
    return {};
  }, []);

  return { goal, loading, error, upsert, remove, reload: load };
}
