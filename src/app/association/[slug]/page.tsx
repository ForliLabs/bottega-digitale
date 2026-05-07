export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getAssociationStats } from "@/lib/association-portal";
import { AssociationImportClient } from "./association-import-client";

interface AssociationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AssociationDashboard({ params }: AssociationPageProps) {
  const { slug } = await params;
  const association = await prisma.association.findUnique({ where: { slug } });

  if (!association) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-4xl">🏛️</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Associazione non trovata</h1>
          <p className="mt-2 text-slate-500">Il portale richiesto non esiste.</p>
        </div>
      </div>
    );
  }

  const stats = await getAssociationStats(association.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Header with association branding */}
        <section
          className="rounded-3xl border p-8 shadow-sm"
          style={{
            borderColor: `${association.primaryColor}33`,
            background: `linear-gradient(135deg, ${association.primaryColor}08, white, ${association.primaryColor}05)`,
          }}
        >
          <div className="flex items-center gap-4">
            {association.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={association.logoUrl} alt={association.name} className="h-16 w-16 rounded-xl object-contain" />
            )}
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-[0.2em]"
                style={{ color: association.primaryColor }}
              >
                Portale Associazione
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">{association.name}</h1>
              <p className="mt-1 text-sm text-slate-600">
                {association.type} · {association.city}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.totalMembers}</p>
            <p className="text-xs text-slate-500">Attività associate</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.activeMembers}</p>
            <p className="text-xs text-slate-500">Attive</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
            <p className="text-xs text-slate-500">Prenotazioni totali</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.totalCustomers}</p>
            <p className="text-xs text-slate-500">Clienti serviti</p>
          </div>
        </section>

        {/* Subscription */}
        {stats.subscription && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Abbonamento di gruppo
            </h2>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <span className="text-slate-500">Piano:</span>{" "}
                <span className="font-medium capitalize text-slate-900">{stats.subscription.plan}</span>
              </div>
              <div>
                <span className="text-slate-500">Costo per membro:</span>{" "}
                <span className="font-medium text-slate-900">€{stats.subscription.pricePerMember}/mese</span>
              </div>
              <div>
                <span className="text-slate-500">Stato:</span>{" "}
                <span className={`font-medium ${stats.subscription.status === "active" ? "text-green-700" : "text-red-700"}`}>
                  {stats.subscription.status === "active" ? "Attivo" : "Non attivo"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Member list */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Attività associate</h2>
            <p className="text-sm text-slate-500">
              {stats.activeMembers} attive · {stats.invitedMembers} invitate
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.businesses.map((biz) => (
              <div key={biz.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-slate-900">{biz.name}</p>
                  <p className="text-sm text-slate-500">{biz.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  {biz.websitePublished && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Sito online
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      biz.status === "active"
                        ? "bg-green-100 text-green-700"
                        : biz.status === "invited"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {biz.status === "active" ? "Attiva" : biz.status === "invited" ? "Invitata" : "Sospesa"}
                  </span>
                </div>
              </div>
            ))}
            {stats.businesses.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-slate-400">
                Nessuna attività associata. Usa l&apos;importazione CSV per aggiungere membri.
              </div>
            )}
          </div>
        </section>

        <AssociationImportClient associationId={association.id} />
      </div>
    </div>
  );
}
