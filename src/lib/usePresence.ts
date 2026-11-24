import { useEffect, useState } from "react";

/**
 * Keeps something mounted for `exitMs` after `open` turns false, so it can play
 * an exit animation instead of vanishing. `exiting` is true during that window.
 */
export function usePresence(open: boolean, exitMs: number) {
  const [rendered, setRendered] = useState(open);
  // Adjust state while rendering when `open` flips on (React's documented pattern).
  if (open && !rendered) setRendered(true);

  useEffect(() => {
    if (open || !rendered) return;
    const id = window.setTimeout(() => setRendered(false), exitMs);
    return () => window.clearTimeout(id);
  }, [open, rendered, exitMs]);

  return { mounted: open || rendered, exiting: !open && rendered };
}
