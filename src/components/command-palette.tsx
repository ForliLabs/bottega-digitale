"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────

export interface CommandItem {
  id: string;
  label: string;
  href: string;
  section?: string;
  keywords?: string[];
  icon?: React.ReactNode;
}

interface CommandPaletteProps {
  items: CommandItem[];
}

// ─── Fuzzy match helper ─────────────────────────────────────────

function matchesQuery(item: CommandItem, query: string): boolean {
  const q = query.toLowerCase();
  if (item.label.toLowerCase().includes(q)) return true;
  if (item.section?.toLowerCase().includes(q)) return true;
  if (item.keywords?.some((kw) => kw.toLowerCase().includes(q))) return true;
  return false;
}

// ─── Component ──────────────────────────────────────────────────

export function CommandPalette({ items }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    return items.filter((item) => matchesQuery(item, query));
  }, [items, query]);

  // Clamp selectedIndex to valid range during render (no effect needed)
  const clampedIndex = filtered.length > 0 ? Math.min(selectedIndex, filtered.length - 1) : 0;

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.children[clampedIndex] as HTMLElement | undefined;
    selected?.scrollIntoView({ block: "nearest" });
  }, [clampedIndex]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const navigate = useCallback(
    (item: CommandItem) => {
      close();
      router.push(item.href);
    },
    [close, router],
  );

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % Math.max(filtered.length, 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
          break;
        case "Enter":
          e.preventDefault();
          if (filtered[clampedIndex]) {
            navigate(filtered[clampedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          close();
          break;
      }
    },
    [filtered, clampedIndex, navigate, close],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Ricerca comandi"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Palette container */}
      <div className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cerca pagine..."
            className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            aria-label="Cerca pagine"
            aria-activedescendant={
              filtered[clampedIndex] ? `cmd-item-${filtered[clampedIndex].id}` : undefined
            }
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-autocomplete="list"
          />
          <kbd className="hidden rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-400 sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ul
          ref={listRef}
          id="command-palette-list"
          role="listbox"
          className="max-h-72 overflow-y-auto px-2 py-2"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-gray-500">
              Nessun risultato per &ldquo;{query}&rdquo;
            </li>
          ) : (
            filtered.map((item, index) => (
              <li
                key={item.id}
                id={`cmd-item-${item.id}`}
                role="option"
                aria-selected={index === clampedIndex}
                onClick={() => navigate(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  index === clampedIndex
                    ? "bg-amber-50 text-amber-900"
                    : "text-gray-700 hover:bg-gray-50",
                )}
              >
                {item.icon && <span className="h-5 w-5 shrink-0">{item.icon}</span>}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.label}</p>
                  {item.section && (
                    <p className="truncate text-xs text-gray-400">{item.section}</p>
                  )}
                </div>
                {index === clampedIndex && (
                  <kbd className="hidden rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-xs text-amber-600 sm:inline-block">
                    ↵
                  </kbd>
                )}
              </li>
            ))
          )}
        </ul>

        {/* Footer hint */}
        <div className="border-t border-gray-100 px-4 py-2">
          <p className="text-xs text-gray-400">
            <kbd className="rounded border border-gray-200 px-1 py-0.5 text-[10px]">↑↓</kbd>{" "}
            navigare{" "}
            <kbd className="rounded border border-gray-200 px-1 py-0.5 text-[10px]">↵</kbd>{" "}
            selezionare{" "}
            <kbd className="rounded border border-gray-200 px-1 py-0.5 text-[10px]">ESC</kbd>{" "}
            chiudere
          </p>
        </div>
      </div>
    </div>
  );
}
