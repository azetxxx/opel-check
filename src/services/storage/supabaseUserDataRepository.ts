import { getSupabaseClient } from '../../lib/supabase';

const requireUserId = async () => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Supabase authentication required.');
  return data.user.id;
};

export const supabaseUserDataRepository = {
  async get<T>(key: string): Promise<T | null> {
    const supabase = getSupabaseClient();
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return data ? (data.data as T) : null;
  },

  async set<T>(key: string, value: T): Promise<void> {
    const supabase = getSupabaseClient();
    const userId = await requireUserId();

    const { error } = await supabase
      .from('user_data')
      .upsert(
        { user_id: userId, key, data: value as any, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,key' }
      );

    if (error) throw error;
  }
};
