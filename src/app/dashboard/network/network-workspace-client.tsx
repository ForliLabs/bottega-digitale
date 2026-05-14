"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

interface PartnershipItem {
  id: string;
  type: string;
  status: string;
  partner: { name: string; category: string; slug: string };
  direction: string;
}

interface PromotionItem {
  id: string;
  partnershipId: string;
  discountPercent: number;
  description: string;
  active: boolean;
  partnerName: string;
  direction: string;
}

interface VoucherItem {
  id: string;
  code: string;
  discountPercent: number;
  description: string;
  redeemed: boolean;
  expiresAt: string;
}

interface DirectoryBusinessItem {
  name: string;
  category: string;
  slug: string;
}

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

export function NetworkWorkspaceClient({
  initialPartnerships,
  initialPromotions,
  initialVouchers,
  directoryBusinesses,
}: {
  initialPartnerships: PartnershipItem[];
  initialPromotions: PromotionItem[];
  initialVouchers: VoucherItem[];
  directoryBusinesses: DirectoryBusinessItem[];
}) {
  const { notify } = useToast();
  const [partnerships, setPartnerships] = useState(initialPartnerships);
  const [promotions, setPromotions] = useState(initialPromotions);
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [voucherPhones, setVoucherPhones] = useState<Record<string, string>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const promotionMap = useMemo(
    () => new Map(promotions.map((promotion) => [promotion.partnershipId, promotion])),
    [promotions],
  );

  async function invitePartner(partnerSlug: string) {
    setLoadingKey(`invite-${partnerSlug}`);
    setError("");
    try {
      const response = await fetch("/api/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite", partnerSlug }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile inviare l'invito.");
      }
      const business = directoryBusinesses.find((item) => item.slug === partnerSlug);
      if (business) {
        setPartnerships((current) => [
          {
            id: data.id,
            type: data.type,
            status: data.status,
            partner: { name: business.name, category: business.category, slug: business.slug },
            direction: "inviata",
          },
          ...current,
        ]);
      }
      notify({ tone: "success", title: "Invito partnership inviato" });
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Impossibile inviare l'invito.");
    } finally {
      setLoadingKey(null);
    }
  }

  async function respondToPartnership(partnershipId: string, accept: boolean) {
    setLoadingKey(`respond-${partnershipId}`);
    setError("");
    try {
      const response = await fetch("/api/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "respond", partnershipId, accept }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile aggiornare la partnership.");
      }
      setPartnerships((current) => current.map((partnership) => partnership.id === partnershipId ? { ...partnership, status: accept ? "active" : "declined" } : partnership));
      notify({ tone: "success", title: accept ? "Partnership attivata" : "Partnership rifiutata" });
    } catch (respondError) {
      setError(respondError instanceof Error ? respondError.message : "Impossibile aggiornare la partnership.");
    } finally {
      setLoadingKey(null);
    }
  }

  async function createPromotion(partnership: PartnershipItem) {
    setLoadingKey(`promo-${partnership.id}`);
    setError("");
    try {
      const response = await fetch("/api/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-promo",
          partnershipId: partnership.id,
          discountPercent: 10,
          description: `Sconto partner attivo con ${partnership.partner.name}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile creare la promozione.");
      }
      setPromotions((current) => [
        {
          id: data.id,
          partnershipId: partnership.id,
          discountPercent: data.discountPercent,
          description: data.description,
          active: data.active,
          partnerName: partnership.partner.name,
          direction: "sent",
        },
        ...current,
      ]);
      notify({ tone: "success", title: "Promozione attivata" });
    } catch (promoError) {
      setError(promoError instanceof Error ? promoError.message : "Impossibile creare la promozione.");
    } finally {
      setLoadingKey(null);
    }
  }

  async function generateVoucher(promotion: PromotionItem) {
    setLoadingKey(`voucher-${promotion.id}`);
    setError("");
    try {
      const response = await fetch("/api/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-voucher",
          crossPromotionId: promotion.id,
          customerPhone: voucherPhones[promotion.id] || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile generare il voucher.");
      }
      setVouchers((current) => [
        {
          id: data.id,
          code: data.code,
          discountPercent: data.discountPercent,
          description: data.description,
          redeemed: data.redeemed,
          expiresAt: data.expiresAt,
        },
        ...current,
      ]);
      notify({ tone: "success", title: "Voucher generato" });
    } catch (voucherError) {
      setError(voucherError instanceof Error ? voucherError.message : "Impossibile generare il voucher.");
    } finally {
      setLoadingKey(null);
    }
  }

  async function copyVoucher(code: string) {
    await navigator.clipboard.writeText(code);
    notify({ tone: "success", title: "Codice voucher copiato" });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Rete di quartiere</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Promozioni incrociate</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Invita partner, attiva promozioni condivise e genera voucher pronti da usare nel distretto.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/experiences" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Landing esperienze</Link>
            <Link href="/marketplace" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Vai al marketplace</Link>
          </div>
        </div>
      </section>

      {error ? <InlineMessage tone="error" title={error} /> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center"><p className="text-2xl font-bold text-slate-900">{partnerships.length}</p><p className="text-xs text-slate-500">Partnership</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center"><p className="text-2xl font-bold text-emerald-700">{partnerships.filter((item) => item.status === "active").length}</p><p className="text-xs text-slate-500">Attive</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center"><p className="text-2xl font-bold text-slate-900">{promotions.length}</p><p className="text-xs text-slate-500">Promozioni attive</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center"><p className="text-2xl font-bold text-slate-900">{vouchers.filter((item) => item.redeemed).length}/{vouchers.length}</p><p className="text-xs text-slate-500">Voucher riscattati</p></div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">🤝 Partnership</h2>
          <p className="mt-1 text-sm text-slate-500">Accetta, rifiuta o porta avanti le collaborazioni già attive.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {partnerships.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-400">Nessuna partnership. Invita un&apos;attività dalla directory per iniziare.</div>
          ) : partnerships.map((partnership) => {
            const promotion = promotionMap.get(partnership.id);
            return (
              <div key={partnership.id} className="space-y-4 px-6 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{partnership.partner.name}</p>
                    <p className="text-sm text-slate-500">{partnership.partner.category} · {TYPE_LABELS[partnership.type] || partnership.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{partnership.direction}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[partnership.status]}`}>{partnership.status === "active" ? "Attiva" : partnership.status === "pending" ? "In attesa" : partnership.status}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {partnership.status === "pending" && partnership.direction === "ricevuta" ? (
                    <>
                      <button type="button" onClick={() => void respondToPartnership(partnership.id, true)} disabled={loadingKey === `respond-${partnership.id}`} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Accetta</button>
                      <button type="button" onClick={() => void respondToPartnership(partnership.id, false)} disabled={loadingKey === `respond-${partnership.id}`} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">Rifiuta</button>
                    </>
                  ) : null}
                  {partnership.status === "active" && !promotion ? (
                    <button type="button" onClick={() => void createPromotion(partnership)} disabled={loadingKey === `promo-${partnership.id}`} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loadingKey === `promo-${partnership.id}` ? "Attivazione..." : "Attiva promo 10%"}</button>
                  ) : null}
                  {promotion ? <span className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">Promo attiva con {promotion.partnerName}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">🎯 Promozioni attive</h2>
            <p className="mt-1 text-sm text-slate-500">Genera voucher da inviare ai clienti e attiva il passaparola tra botteghe.</p>
          </div>
        </div>
        {promotions.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">Attiva una partnership per pubblicare la prima promozione.</div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {promotions.map((promotion) => (
              <div key={promotion.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{promotion.partnerName}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">-{promotion.discountPercent}%</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{promotion.description}</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={voucherPhones[promotion.id] || ""}
                    onChange={(event) => setVoucherPhones((current) => ({ ...current, [promotion.id]: event.target.value }))}
                    placeholder="Telefono cliente (opzionale)"
                    className="flex-1 rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm"
                  />
                  <button type="button" onClick={() => void generateVoucher(promotion)} disabled={loadingKey === `voucher-${promotion.id}`} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loadingKey === `voucher-${promotion.id}` ? "Creazione..." : "Genera voucher"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {vouchers.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">🎟️ Voucher</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-medium text-slate-900">{voucher.code}</span>
                    <span className="text-sm text-slate-500">-{voucher.discountPercent}%</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{voucher.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs ${voucher.redeemed ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>{voucher.redeemed ? "Riscattato" : `Scade ${new Date(voucher.expiresAt).toLocaleDateString("it-IT")}`}</span>
                  <button type="button" onClick={() => void copyVoucher(voucher.code)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Copia codice</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {directoryBusinesses.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">📍 Attività nella directory</h2>
          <p className="mt-1 text-sm text-slate-500">Invita attività pubblicate per accendere nuovi bundle di quartiere.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {directoryBusinesses.map((business) => (
              <div key={business.slug} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">{business.name}</p>
                  <p className="text-xs text-slate-400">{business.category}</p>
                </div>
                <button type="button" onClick={() => void invitePartner(business.slug)} disabled={loadingKey === `invite-${business.slug}`} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loadingKey === `invite-${business.slug}` ? "Invio..." : "Invita"}</button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
