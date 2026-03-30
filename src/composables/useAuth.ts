import { computed, ref } from 'vue';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

const user = ref<User | null>(null);
const session = ref<Session | null>(null);
const loading = ref(false);
const authInitialized = ref(false);
let authSubscriptionBound = false;

const initializeAuth = async () => {
  if (authInitialized.value || !isSupabaseConfigured()) return;

  loading.value = true;

  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    session.value = data.session;
    user.value = data.session?.user ?? null;

    if (!authSubscriptionBound) {
      supabase.auth.onAuthStateChange((_event, nextSession) => {
        session.value = nextSession;
        user.value = nextSession?.user ?? null;
      });
      authSubscriptionBound = true;
    }

    authInitialized.value = true;
  } finally {
    loading.value = false;
  }
};

export function useAuth() {
  void initializeAuth();

  const signInWithMagicLink = async (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new Error('Bitte E-Mail-Adresse eingeben.');
    }

    const supabase = getSupabaseClient();
    return supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    return supabase.auth.signOut();
  };

  return {
    user,
    session,
    isAuthenticated: computed(() => Boolean(user.value)),
    isConfigured: computed(() => isSupabaseConfigured()),
    isLoading: computed(() => loading.value),
    signInWithMagicLink,
    signOut,
    initializeAuth
  };
}
