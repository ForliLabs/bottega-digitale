"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const mobileMenuId = "mobile-navigation";
  // Ref to the hamburger button so we can restore focus when the menu closes
  const toggleRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setOpen(false);
    // Return focus to the toggle button so keyboard/AT users don't lose their place
    window.requestAnimationFrame(() => {
      toggleRef.current?.focus();
    });
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${brand} – torna alla home`} className="text-xl font-bold text-gray-900">
          {brand}
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {items.map((item) => {
            const isActive = item.href !== "/" && pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2",
                  isActive ? "text-slate-900" : "text-gray-600 hover:text-gray-900",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            >
              {ctaLabel}
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          className="rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 md:hidden"
          onClick={() => (open ? closeMenu() : setOpen(true))}
          aria-label={open ? "Chiudi menu" : "Apri menu"}
          aria-expanded={open}
          aria-controls={mobileMenuId}
          type="button"
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
      <div id={mobileMenuId} className={cn("border-t md:hidden", open ? "block" : "hidden")}>
        <div className="space-y-1 px-4 py-3">
          {items.map((item) => {
            const isActive = item.href !== "/" && pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2",
                  isActive ? "bg-amber-50 text-amber-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
                onClick={closeMenu}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="mt-2 block rounded-lg bg-blue-600 px-3 py-2 text-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              onClick={closeMenu}
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
