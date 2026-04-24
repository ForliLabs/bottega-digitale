export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";

const TYPE_LABELS: Record<string, string> = {
  sconto_reciproco: "🤝 Sconto reciproco",
  punti_condivisi: "⭐ Punti condivisi",
  evento_congiunto: "🎉 Evento congiunto",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  active: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-700",
  ended: "bg-slate-100 text-slate-500",
};

export default async function NetworkPage() {
  const business = await getBusinessContext();

  let partnerships: {
    id: string;
    type: string;
    status: string;
    partner: { name: string; category: string; slug: string };
    direction: string;
  }[] = [];

  let promotions: {
    id: string;
    discountPercent: number;
    description: string;
    active: boolean;
  }[] = [];

  let vouchers: {
    id: string;
    code: string;
    discountPercent: number;
    description: string;
    redeemed: boolean;
    expiresAt: Date;
  }[] = [];

  let directoryBusinesses: { name: string; category: string; slug: string }[] = [];

  if (business) {
    const [pA, pB, promos, voucherList] = await Promise.all([
      prisma.partnership.findMany({
        where: { businessAId: business.id },
        include: { businessB: { select: { name: true, category: true, slug: true } } },
      }),
      prisma.partnership.findMany({
        where: { businessBId: business.id },
        include: { businessA: { select: { name: true, category: true, slug: true } } },
      }),
      prisma.crossPromotion.findMany({
        where: { OR: [{ fromBusinessId: business.id }, { toBusinessId: business.id }] },
      }),
      prisma.voucher.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    partnerships = [
      ...pA.map((p) => ({ id: p.id, type: p.type, status: p.status, partner: p.businessB, direction: "inviata" })),
      ...pB.map((p) => ({ id: p.id, type: p.type, status: p.status, partner: p.businessA, direction: "ricevuta" })),
    ];
    promotions = promos;
    vouchers = voucherList;

    directoryBusinesses = await prisma.business.findMany({
      where: { id: { not: business.id }, websitePublished: true },
      select: { name: true, category: true, slug: true },
      take: 10,
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
          Rete di Quartiere
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Promozioni Incrociate
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Collabora con le attività vicine: crea sconti reciproci, condividi punti fedeltà
          e organizza eventi congiunti per far crescere il quartiere.
        </p>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{partnerships.length}</p>
          <p className="text-xs text-slate-500">Partnership</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{partnerships.filter((p) => p.status === "active").length}</p>
          <p className="text-xs text-slate-500">Attive</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{promotions.length}</p>
          <p className="text-xs text-slate-500">Promozioni</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{vouchers.filter((v) => v.redeemed).length}/{vouchers.length}</p>
          <p className="text-xs text-slate-500">Voucher riscattati</p>
        </div>
      </section>

      {/* Partnerships */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">🤝 Partnership</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {partnerships.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-slate-900">{p.partner.name}</p>
                <p className="text-sm text-slate-500">{p.partner.category} · {TYPE_LABELS[p.type] || p.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{p.direction}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[p.status]}`}>
                  {p.status === "active" ? "Attiva" : p.status === "pending" ? "In attesa" : p.status}
                </span>
              </div>
            </div>
          ))}
          {partnerships.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              Nessuna partnership. Invita un&apos;attività dalla directory per iniziare.
            </div>
          )}
        </div>
      </section>

      {/* Vouchers */}
      {vouchers.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">🎟️ Voucher</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {vouchers.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-6 py-3 text-sm">
                <div>
                  <span className="font-mono font-medium text-slate-900">{v.code}</span>
                  <span className="ml-2 text-slate-500">-{v.discountPercent}%</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${v.redeemed ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {v.redeemed ? "Riscattato" : `Scade ${new Date(v.expiresAt).toLocaleDateString("it-IT")}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Available businesses to partner with */}
      {directoryBusinesses.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">📍 Attività nella directory</h2>
          <p className="mt-1 text-sm text-slate-500">Invita queste attività a creare una partnership.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {directoryBusinesses.map((b) => (
              <div key={b.slug} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{b.name}</p>
                  <p className="text-xs text-slate-400">{b.category}</p>
                </div>
                <span className="rounded-lg bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                  Invita
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
