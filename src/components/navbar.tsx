"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  brand: string;
  items: NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
}

export function Navbar({ brand, items, ctaLabel, ctaHref }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-gray-900">
          {brand}
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {ctaLabel}
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn("border-t md:hidden", open ? "block" : "hidden")}>
        <div className="space-y-1 px-4 py-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="mt-2 block rounded-lg bg-blue-600 px-3 py-2 text-center text-base font-medium text-white hover:bg-blue-700"
              onClick={() => setOpen(false)}
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
