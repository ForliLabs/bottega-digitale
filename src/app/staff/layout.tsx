"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const staffNavItems = [
  { href: "/staff", label: "Oggi", icon: "📅" },
  { href: "/staff/customers", label: "Clienti", icon: "👥" },
  { href: "/staff/notifications", label: "Notifiche", icon: "🔔" },
  { href: "/staff/profile", label: "Profilo", icon: "👤" },
];

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="mx-auto max-w-lg px-4 py-6">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white" aria-label="Navigazione staff">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {staffNavItems.map((item) => {
            const isActive = item.href === "/staff"
              ? pathname === "/staff"
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-inset",
                  isActive
                    ? "text-amber-600 border-t-2 border-amber-500"
                    : "text-slate-600 hover:text-slate-900 border-t-2 border-transparent",
                )}
              >
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
