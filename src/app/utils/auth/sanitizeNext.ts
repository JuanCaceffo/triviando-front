const ROOM_NEXT_PATTERN = /^\/room\/[A-Za-z0-9]{6}$/;

/**
 * Solo permite volver a una sala concreta. Evita open redirects y rutas
 * internas arbitrarias.
 */
export const sanitizeNext = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  if (!ROOM_NEXT_PATTERN.test(raw)) return null;
  return raw;
};

export const getNextFromLocation = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sanitizeNext(new URLSearchParams(window.location.search).get('next'));
};

export const resolvePostLoginPath = (
  username: string,
  next: string | null | undefined,
): string => sanitizeNext(next) ?? `/${username}/topics`;
