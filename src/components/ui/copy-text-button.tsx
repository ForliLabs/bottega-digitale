"use client";

import { useState } from "react";

/**
 * Copies arbitrary text content to the clipboard.
 * Used e.g. to copy generated review replies from the dashboard.
 */
export function CopyTextButton({
  text,
  label = "Copia",
  copiedLabel = "Copiato!",
  className = "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-1",
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard not available (e.g. non-secure context) — silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copyText()}
      aria-label={copied ? copiedLabel : `${label} risposta suggerita`}
      className={className}
    >
      {copied ? (
        <>
          <span aria-hidden="true">✓</span> {copiedLabel}
        </>
      ) : (
        <>
          <span aria-hidden="true">📋</span> {label}
        </>
      )}
    </button>
  );
}
