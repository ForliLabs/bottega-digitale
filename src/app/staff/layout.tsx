// Staff Mobile Layout — Bottom-tab navigation optimized for mobile
export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="mx-auto max-w-lg px-4 py-6">{children}</main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          <a
            href="/staff"
            className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-blue-600"
          >
            <span className="text-lg">📅</span>
            Oggi
          </a>
          <a
            href="/staff/customers"
            className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            <span className="text-lg">👥</span>
            Clienti
          </a>
          <a
            href="/staff/notifications"
            className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            <span className="text-lg">🔔</span>
            Notifiche
          </a>
          <a
            href="/staff/profile"
            className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            <span className="text-lg">👤</span>
            Profilo
          </a>
        </div>
      </nav>
    </div>
  );
}
