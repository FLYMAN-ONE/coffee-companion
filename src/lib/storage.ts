import { useEffect, useState } from "react";

/**
 * State persisted to localStorage as JSON. `sanitize` repairs or replaces
 * whatever is read back, so a corrupted or outdated value never reaches the UI.
 */
export function useLocalStorage<T>(key: string, initial: T, sanitize?: (raw: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initial;
      const parsed: unknown = JSON.parse(raw);
      return sanitize ? sanitize(parsed) : (parsed as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable: keep working in memory
    }
  }, [key, value]);

  return [value, setValue] as const;
}
