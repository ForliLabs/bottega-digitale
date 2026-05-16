"use client";

import { useState } from "react";

export function CopyLinkButton({
  url,
  label = "Copia link",
  copiedLabel = "Link copiato",
  className = "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1",
  "aria-label": ariaLabel,
}: {
  url: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  "aria-label"?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const value = url.startsWith("http")
      ? url
      : `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void copyLink()}
        className={className}
        /* aria-label stays constant — success feedback is delivered by the
           always-mounted live region below, not by changing the button label
           or adding toggle semantics (aria-pressed is incorrect here because
           the action is not a persistent toggle state). */
        aria-label={ariaLabel ?? label}
      >
        {copied ? copiedLabel : label}
      </button>
      {/* Always-mounted polite live region announces the copied status once
          without interrupting the user and without toggle semantics. */}
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}
