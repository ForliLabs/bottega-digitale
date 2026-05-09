"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useMemo, useState, type ReactNode } from "react";

interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  brand: string;
  items: SidebarItem[];
  children: ReactNode;
}

export function DashboardShell({ brand, items, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const primaryItems = useMemo(() => items.slice(0, 5), [items]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-200 px-6 py-4">
            <Link href="/dashboard" className="text-lg font-bold text-gray-900">
              {brand}
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigazione dashboard">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
            })}
          </nav>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Dashboard</p>
              <Link href="/dashboard" className="text-lg font-bold text-slate-900">
                {brand}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              aria-expanded={mobileMenuOpen}
              aria-controls="dashboard-mobile-menu"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              {mobileMenuOpen ? "Chiudi" : "Menu"}
            </button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Scorciatoie dashboard">
            {primaryItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
          {mobileMenuOpen ? (
            <div id="dashboard-mobile-menu" className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                        isActive
                          ? "bg-amber-50 text-amber-700"
                          : "bg-white text-slate-700 hover:bg-slate-100",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="h-5 w-5">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
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
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {change && (
        <p
          className={cn(
            "mt-2 text-sm font-medium",
            trend === "up" && "text-green-600",
            trend === "down" && "text-red-600",
            trend === "neutral" && "text-gray-500"
          )}
        >
          {change}
        </p>
      )}
    </div>
  );
}
