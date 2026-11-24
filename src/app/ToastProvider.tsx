import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ToastContext } from "./toast";

const DURATION_MS = 2600;

/** Provides `useToast()` and renders the current toast. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef(0);

  const toast = useCallback((text: string) => {
    setMessage(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), DURATION_MS);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext value={toast}>
      {children}
      {message ? (
        <div
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-8 z-[60] flex justify-center px-4"
        >
          <div className="rounded-full border border-line bg-raise px-6 py-3 text-base shadow-card">
            {message}
          </div>
        </div>
      ) : null}
    </ToastContext>
  );
}
