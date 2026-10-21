import { useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabaseClient';

/**
 * useGoal — the shared single fitness goal (one row for the whole app).
 * Exposes { goal, loading, error, upsert, remove }.
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
    // Single shared goal row. If a row exists, update it; otherwise insert.
    // We fetch first because there's no user_id to upsert on anymore.
    const { data: existing } = await supabase
      .from('goals')
      .select('id')
      .limit(1)
      .maybeSingle();
    let result;
    if (existing) {
      result = await supabase
        .from('goals')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .maybeSingle();
    } else {
      result = await supabase
        .from('goals')
        .insert(payload)
        .select()
        .maybeSingle();
    }
    if (result.error) return { error: result.error };
    setGoal(result.data);
    return { goal: result.data };
  }, []);

  const remove = useCallback(async () => {
    const { error } = await supabase.from('goals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) return { error };
    setGoal(null);
    return {};
  }, []);

  return { goal, loading, error, upsert, remove, reload: load };
}
