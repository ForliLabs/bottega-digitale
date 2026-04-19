"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-200 px-6 py-4">
            <Link href="/dashboard" className="text-lg font-bold text-gray-900">
              {brand}
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <span className="h-5 w-5">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
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
