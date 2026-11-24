import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePresence } from "../lib/usePresence";
import { ToastContext } from "./toast";

const DURATION_MS = 2600;

/** Provides `useToast()` and renders the current toast. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const presence = usePresence(visible, 200);
  const [stamp, setStamp] = useState(0);
  const timer = useRef(0);

  const toast = useCallback((text: string) => {
    setMessage(text);
    setVisible(true);
    setStamp((n) => n + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), DURATION_MS);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext value={toast}>
      {children}
      {presence.mounted && message ? (
        <div
          key={message + stamp}
          role="status"
          className="motion-fade pointer-events-none fixed inset-x-0 top-[max(28px,env(safe-area-inset-top))] z-[90] flex justify-center px-4"
          style={{
            // Leaves through the same edge it came from.
            animation: presence.exiting
              ? "toast-out 200ms var(--ease-out) forwards"
              : "toast-in 400ms var(--ease-out)",
          }}
        >
          <div className="rounded-[20px] bg-raised-2 px-5 py-3 text-[14.5px] font-semibold shadow-[0_10px_30px_rgb(0_0_0/0.4)]">
            {message}
          </div>
        </div>
      ) : null}
    </ToastContext>
  );
}
