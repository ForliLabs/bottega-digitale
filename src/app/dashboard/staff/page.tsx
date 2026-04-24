export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";

const ROLE_LABELS: Record<string, string> = {
  owner: "Titolare",
  manager: "Responsabile",
  staff: "Collaboratore",
};

export default async function StaffPage() {
  const business = await getBusinessContext();

  let staff: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
    color: string;
    workingHours: string;
    serviceIds: string;
    active: boolean;
    createdAt: Date;
  }[] = [];

  let staffStats: Record<string, { totalBookings: number; revenue: number }> = {};

  if (business) {
    staff = await prisma.staffProfile.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "asc" },
    });

    // Compute stats per staff member
    for (const member of staff) {
      const [total, revenue] = await Promise.all([
        prisma.booking.count({ where: { staffId: member.id } }),
        prisma.booking.aggregate({
          where: { staffId: member.id, status: "Completata" },
          _sum: { priceEuro: true },
        }),
      ]);
      staffStats[member.id] = {
        totalBookings: total,
        revenue: revenue._sum.priceEuro || 0,
      };
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
          Team
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Gestione Collaboratori
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Gestisci il team della tua bottega: calendari individuali, servizi assegnati e statistiche per ogni collaboratore.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{staff.length}</p>
          <p className="text-xs text-slate-500">Collaboratori</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{staff.filter((s) => s.active).length}</p>
          <p className="text-xs text-slate-500">Attivi</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {Object.values(staffStats).reduce((sum, s) => sum + s.totalBookings, 0)}
          </p>
          <p className="text-xs text-slate-500">Prenotazioni totali</p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {staff.map((member) => {
          const stats = staffStats[member.id] || { totalBookings: 0, revenue: 0 };
          return (
            <div key={member.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white text-lg font-bold"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      member.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {member.active ? "Attivo" : "Inattivo"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{ROLE_LABELS[member.role] || member.role}</p>
                  {member.email && (
                    <p className="mt-1 text-xs text-slate-400">{member.email}</p>
                  )}
                  {member.phone && (
                    <p className="text-xs text-slate-400">{member.phone}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{stats.totalBookings}</p>
                  <p className="text-xs text-slate-500">Prenotazioni</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">€{stats.revenue.toFixed(0)}</p>
                  <p className="text-xs text-slate-500">Ricavi</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {staff.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-3xl">👥</p>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Nessun collaboratore</h3>
          <p className="mt-2 text-sm text-slate-500">
            Aggiungi i membri del tuo team per gestire calendari individuali e assegnare prenotazioni.
          </p>
        </div>
      )}
    </div>
  );
}
