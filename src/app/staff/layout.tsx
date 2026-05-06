import Link from "next/link";

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
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="mx-auto max-w-lg px-4 py-6">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white" aria-label="Navigazione staff">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {staffNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
