"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  notify: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-slate-200 bg-white text-slate-900",
};

const dismissButtonStyles: Record<ToastTone, string> = {
  success: "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100",
  error: "text-red-500 hover:text-red-800 hover:bg-red-100",
  info: "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
};

function ToastItem({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-md items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-lg",
        toneStyles[toast.tone],
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description ? <p className="mt-1 text-sm opacity-80">{toast.description}</p> : null}
      </div>
      <button
        type="button"
        aria-label="Chiudi notifica"
        onClick={() => onDismiss(toast.id)}
        className={cn(
          "mt-0.5 flex-shrink-0 rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current",
          dismissButtonStyles[toast.tone],
        )}
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  const errorToasts = toasts.filter((t) => t.tone === "error");
  const politeToasts = toasts.filter((t) => t.tone !== "error");

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Fixed container for all toasts — two always-mounted live regions to
          ensure proper assertive/polite announcement by screen readers. */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4">
        {/* Assertive region for errors — announced immediately.
            Using a real block container (not display:contents) ensures
            the live-region element stays in the accessibility tree so
            screen readers reliably track content changes. */}
        <div
          aria-live="assertive"
          aria-atomic="true"
          className="flex w-full flex-col items-center gap-3"
        >
          {errorToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
        {/* Polite region for success/info — announced when idle */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="flex w-full flex-col items-center gap-3"
        >
          {politeToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
