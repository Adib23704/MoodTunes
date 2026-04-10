interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;
const CLEANUP_INTERVAL = 5 * 60_000; // 5 minutes

// Periodic cleanup of stale entries
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    const valid = entry.timestamps.filter((t) => now - t < WINDOW_MS);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      entry.timestamps = valid;
    }
  }
}

export function isRateLimited(ip: string): boolean {
  cleanup();

  const now = Date.now();
  const entry = store.get(ip);

  if (!entry) {
    store.set(ip, { timestamps: [now] });
    return false;
  }

  // Filter to only timestamps within the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
  entry.timestamps.push(now);

  return entry.timestamps.length > MAX_REQUESTS;
}
