/**
 * Supabase / PostgREST often reject with plain objects ({ message, code, details }), not Error instances.
 */
export const formatUserFacingError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const e = error as { message?: string; code?: string; details?: string; hint?: string };
    if (typeof e.message === 'string' && e.message.length > 0) {
      const parts = [e.message];
      if (e.code) parts.push(`Code: ${e.code}`);
      if (e.details) parts.push(e.details);
      if (e.hint) parts.push(e.hint);
      return parts.join(' — ');
    }
  }
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unbekannter Fehler';
  }
};
