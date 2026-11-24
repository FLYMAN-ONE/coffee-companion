import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ToastContext } from "./toast";

const DURATION_MS = 2600;

/** Provides `useToast()` and renders the current toast. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [stamp, setStamp] = useState(0);
  const timer = useRef(0);

  const toast = useCallback((text: string) => {
    setMessage(text);
    setStamp((n) => n + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), DURATION_MS);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext value={toast}>
      {children}
      {message ? (
        <div
          key={message + stamp}
          role="status"
          className="motion-fade pointer-events-none fixed inset-x-0 top-[max(28px,env(safe-area-inset-top))] z-[90] flex justify-center px-4"
          style={{ animation: "toast-in 400ms var(--ease-out)" }}
        >
          <div className="rounded-[20px] bg-raised-2 px-5 py-3 text-[14.5px] font-semibold shadow-[0_10px_30px_rgb(0_0_0/0.4)]">
            {message}
          </div>
        </div>
      ) : null}
    </ToastContext>
  );
}
