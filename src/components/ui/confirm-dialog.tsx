"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "neutral";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  tone = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus the cancel button when the dialog opens (safer default for destructive actions)
  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
    }
  }, [open]);

  // Trap focus inside dialog and handle Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onCancel],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-slate-900"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-desc"
          className="mt-2 text-sm text-slate-600"
        >
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "min-h-[44px] rounded-xl px-5 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2",
              tone === "danger"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                : "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
