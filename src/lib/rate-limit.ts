const attempts = new Map<string, { count: number; reset: number }>();
export function checkRateLimit(key: string, limit = 6, windowMs = 900000) {
  const now = Date.now(),
    v = attempts.get(key);
  if (!v || v.reset < now) {
    attempts.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (v.count >= limit) return false;
  v.count++;
  return true;
}
export function clearRateLimit(key: string) {
  attempts.delete(key);
}
