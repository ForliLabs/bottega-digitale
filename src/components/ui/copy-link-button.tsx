"use client";

import { useState } from "react";

export function CopyLinkButton({
  url,
  label = "Copia link",
  copiedLabel = "Link copiato",
  className = "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50",
}: {
  url: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
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
    <button type="button" onClick={() => void copyLink()} className={className}>
      {copied ? copiedLabel : label}
    </button>
  );
}
