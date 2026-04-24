export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { getProductStats, formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/product-catalog";

export default async function ProductsPage() {
  const business = await getBusinessContext();
  const stats = business ? await getProductStats(business.id) : null;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
          Vetrina Prodotti
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Catalogo Prodotti
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Gestisci il tuo catalogo prodotti, monitora le scorte e gestisci gli ordini.
          I prodotti vengono mostrati nella tua vetrina digitale.
        </p>
      </section>

      {!stats || stats.totalProducts === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-3xl">🛍️</p>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Nessun prodotto</h3>
          <p className="mt-2 text-sm text-slate-500">
            Aggiungi i tuoi prodotti per iniziare a vendere online. Supporta foto, categorie, prezzi e gestione scorte.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{stats.totalProducts}</p>
              <p className="text-xs text-slate-500">Prodotti totali</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{stats.activeProducts}</p>
              <p className="text-xs text-slate-500">Disponibili</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{stats.lowStock}</p>
              <p className="text-xs text-slate-500">Scorte basse</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">{formatPrice(stats.totalRevenue)}</p>
              <p className="text-xs text-slate-500">Ricavi ordini</p>
            </div>
          </section>

          {/* Recent Orders */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Ordini recenti</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{order.customerName}</p>
                    <p className="text-sm text-slate-500">
                      {order.items.map((i) => `${i.quantity}x ${i.product.name}`).join(", ")} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-slate-900">{formatPrice(order.totalEuro)}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_STYLES[order.status] || "bg-slate-100"}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))}
              {stats.recentOrders.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-slate-400">
                  Nessun ordine ricevuto. Condividi la tua vetrina per iniziare!
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
