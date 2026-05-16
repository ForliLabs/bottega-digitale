"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CommandPalette, type CommandItem } from "@/components/command-palette";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
}

export interface SidebarSection {
  key: string;
  label?: string;
  items: SidebarItem[];
}

interface DashboardLayoutProps {
  brand: string;
  sections: SidebarSection[];
  extraCommandItems?: CommandItem[];
  children: ReactNode;
}

function CollapsibleSection({
  section,
  pathname,
  defaultOpen,
}: {
  section: SidebarSection;
  pathname: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!section.label) {
    return (
      <div className="space-y-1">
        {section.items.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
      >
        {section.label}
        <svg
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-1 space-y-1">
          {section.items.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarLink({ item, pathname, onClick }: { item: SidebarItem; pathname: string; onClick?: () => void }) {
  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300",
        isActive
          ? "bg-amber-50 text-amber-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="h-5 w-5">{item.icon}</span>
      {item.label}
    </Link>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

export function DashboardShell({ brand, sections, extraCommandItems, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Move focus into the drawer on open; return focus to trigger on close
  useEffect(() => {
    if (mobileMenuOpen) {
      // Small delay to allow the drawer to render/transition
      const id = window.setTimeout(() => {
        drawerRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(id);
    } else {
      triggerRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  // Escape key closes the drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Trap focus inside the drawer while open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    function handleFocusTrap(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = drawer!.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
    document.addEventListener("keydown", handleFocusTrap);
    return () => document.removeEventListener("keydown", handleFocusTrap);
  }, [mobileMenuOpen]);

  const allItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  const primaryItems = useMemo(() => allItems.slice(0, 5), [allItems]);

  const commandItems: CommandItem[] = useMemo(
    () => [
      ...sections.flatMap((section) =>
        section.items.map((item) => ({
          id: item.href,
          label: item.label,
          href: item.href,
          section: section.label,
          icon: item.icon,
        })),
      ),
      ...(extraCommandItems ?? []),
    ],
    [sections, extraCommandItems],
  );

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  // Auto-open sections that contain the active route
  const isSectionActive = useCallback(
    (section: SidebarSection) =>
      section.items.some(
        (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
      ),
    [pathname],
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-200 px-6 py-4">
            <Link href="/dashboard" className="text-lg font-bold text-gray-900">
              {brand}
            </Link>
          </div>
          <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4" aria-label="Navigazione dashboard">
            {sections.map((section) => (
              <CollapsibleSection
                key={section.key}
                section={section}
                pathname={pathname}
                defaultOpen={!section.label || isSectionActive(section)}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        id="dashboard-mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal={mobileMenuOpen}
        aria-label="Navigazione dashboard mobile"
        tabIndex={-1}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
            <Link href="/dashboard" className="text-lg font-bold text-gray-900" onClick={closeMobileMenu}>
              {brand}
            </Link>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-300"
              aria-label="Chiudi menu"
            >
              <HamburgerIcon open />
            </button>
          </div>
          <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
            {sections.map((section) => (
              <MobileSidebarSection
                key={section.key}
                section={section}
                pathname={pathname}
                onNavigate={closeMobileMenu}
                defaultOpen={!section.label || isSectionActive(section)}
              />
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                ref={triggerRef}
                onClick={() => setMobileMenuOpen(true)}
                aria-expanded={mobileMenuOpen}
                aria-controls="dashboard-mobile-drawer"
                className="rounded-lg p-1.5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-300"
                aria-label="Apri menu"
              >
                <HamburgerIcon open={false} />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Dashboard</p>
                <Link href="/dashboard" className="text-lg font-bold text-slate-900">
                  {brand}
                </Link>
              </div>
            </div>
          </div>
          {/* Quick-access chips for top routes */}
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Scorciatoie dashboard">
            {primaryItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex min-w-fit items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium",
                    isActive
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-white text-slate-600",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>

      <CommandPalette items={commandItems} />
    </div>
  );
}

function MobileSidebarSection({
  section,
  pathname,
  onNavigate,
  defaultOpen,
}: {
  section: SidebarSection;
  pathname: string;
  onNavigate: () => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!section.label) {
    return (
      <div className="space-y-1">
        {section.items.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={pathname} onClick={onNavigate} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
      >
        {section.label}
        <svg
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-1 space-y-1">
          {section.items.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} onClick={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ label, value, change, trend }: StatCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <dl>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-2 text-3xl font-bold text-gray-900">{value}</dd>
        {change && (
          <dd
            className={cn(
              "mt-2 text-sm font-medium",
              trend === "up" && "text-green-600",
              trend === "down" && "text-red-600",
              trend === "neutral" && "text-gray-500"
            )}
          >
            {change}
          </dd>
        )}
      </dl>
    </article>
  );
}
