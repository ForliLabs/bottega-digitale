"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { EmptyState, InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";
import {
  formatPrice,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  type OrderStatus,
} from "@/lib/product-catalog-ui";

interface ProductItem {
  id: string;
  name: string;
  description: string;
  priceEuro: number;
  imageUrl: string | null;
  stock: number;
  isAvailable: boolean;
}

interface OrderItem {
  id: string;
  customerName: string;
  channel: string;
  status: string;
  totalEuro: number;
  createdAt: string;
  notes: string | null;
  itemsSummary: string[];
}

interface ProductFormState {
  name: string;
  description: string;
  priceEuro: string;
  stock: string;
  imageUrl: string;
  isAvailable: boolean;
}

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  priceEuro: "",
  stock: "-1",
  imageUrl: "",
  isAvailable: true,
};

export function ProductsWorkspace({
  business,
  initialProducts,
  initialOrders,
}: {
  business: {
    id: string;
    slug: string;
    catalogEnabled: boolean;
  };
  initialProducts: ProductItem[];
  initialOrders: OrderItem[];
}) {
  const { notify } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const activeProducts = products.filter((product) => product.isAvailable).length;
    const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 5).length;
    const totalRevenue = orders
      .filter((order) => order.status === "consegnato")
      .reduce((sum, order) => sum + order.totalEuro, 0);

    return {
      totalProducts: products.length,
      activeProducts,
      lowStock,
      totalRevenue,
    };
  }, [orders, products]);

  function resetForm() {
    setForm(emptyForm);
    setEditingProductId(null);
  }

  function startEditing(product: ProductItem) {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      priceEuro: String(product.priceEuro),
      stock: String(product.stock),
      imageUrl: product.imageUrl || "",
      isAvailable: product.isAvailable,
    });
    setError("");
  }

  async function saveProduct() {
    if (!form.name.trim()) {
      setError("Inserisci il nome del prodotto.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      priceEuro: Number(form.priceEuro),
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim() || null,
      isAvailable: form.isAvailable,
    };

    if (Number.isNaN(payload.priceEuro) || payload.priceEuro < 0) {
      setError("Inserisci un prezzo valido.");
      return;
    }

    if (Number.isNaN(payload.stock)) {
      setError("Inserisci un valore scorte valido.");
      return;
    }

    setSavingProduct(true);
    setError("");
    try {
      const response = await fetch(editingProductId ? `/api/products/${editingProductId}` : "/api/products", {
        method: editingProductId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile salvare il prodotto");
      }

      const savedProduct: ProductItem = {
        id: data.id,
        name: data.name,
        description: data.description,
        priceEuro: data.priceEuro,
        imageUrl: data.imageUrl,
        stock: data.stock,
        isAvailable: data.isAvailable,
      };

      setProducts((current) => {
        if (editingProductId) {
          return current.map((product) => product.id === editingProductId ? savedProduct : product);
        }
        return [savedProduct, ...current];
      });
      resetForm();
      notify({ tone: "success", title: editingProductId ? "Prodotto aggiornato" : "Prodotto creato" });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossibile salvare il prodotto");
    } finally {
      setSavingProduct(false);
    }
  }

  async function deleteProduct(productId: string) {
    setLoadingId(productId);
    setError("");
    try {
      const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile eliminare il prodotto");
      }
      setProducts((current) => current.filter((product) => product.id !== productId));
      if (editingProductId === productId) {
        resetForm();
      }
      notify({ tone: "success", title: "Prodotto eliminato" });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Impossibile eliminare il prodotto");
    } finally {
      setLoadingId(null);
    }
  }

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    setLoadingId(orderId);
    setError("");
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile aggiornare l'ordine");
      }

      setOrders((current) => current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: data.status,
            }
          : order,
      ));
      notify({ tone: "success", title: `Ordine ${ORDER_STATUS_LABELS[status] || status}` });
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Impossibile aggiornare l'ordine");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
              Vetrina prodotti
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Catalogo e ordini
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Crea prodotti, aggiorna disponibilità e porta avanti gli ordini in arrivo senza uscire dalla dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton url={`/shop/${business.slug}`} label="Copia link shop" />
            <a
              href={`/shop/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Anteprima shop ↗
            </a>
            <Link href="/dashboard/settings/features" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Moduli attivi
            </Link>
          </div>
        </div>
      </section>

      {!business.catalogEnabled ? (
        <InlineMessage
          tone="info"
          title="Shop pubblico disattivato"
          description="Puoi già preparare prodotti e ordini qui, poi attivare il catalogo pubblico dalla pagina Moduli attivi."
        />
      ) : null}

      <p role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">{error}</p>
      {error ? <InlineMessage tone="error" title={error} silent /> : null}

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
          <p className="text-xs text-slate-500">Ricavi ordini consegnati</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{editingProductId ? "Modifica prodotto" : "Nuovo prodotto"}</h2>
              <p className="mt-1 text-sm text-slate-500">Usa -1 nelle scorte per indicare disponibilità illimitata.</p>
            </div>
            {editingProductId ? (
              <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Annulla modifica
              </button>
            ) : null}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
              Nome prodotto
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
              Descrizione
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Prezzo (€)
              <input type="number" min="0" step="0.01" value={form.priceEuro} onChange={(event) => setForm((current) => ({ ...current, priceEuro: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Scorte
              <input type="number" min="-1" step="1" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
              URL immagine (opzionale)
              <input type="url" value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" placeholder="https://..." />
            </label>
            <label className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 lg:col-span-2">
              <input type="checkbox" checked={form.isAvailable} onChange={(event) => setForm((current) => ({ ...current, isAvailable: event.target.checked }))} className="h-4 w-4" />
              {form.isAvailable ? "Prodotto disponibile" : "Prodotto nascosto"}
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => void saveProduct()} disabled={savingProduct} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              {savingProduct ? "Salvataggio..." : editingProductId ? "Salva prodotto" : "Crea prodotto"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Catalogo attuale</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {products.length > 0 ? products.map((product) => (
              <div key={product.id} className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${product.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {product.isAvailable ? "Disponibile" : "Nascosto"}
                    </span>
                  </div>
                  {product.description ? <p className="mt-1 text-sm text-slate-500">{product.description}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>{formatPrice(product.priceEuro)}</span>
                    <span>{product.stock < 0 ? "Scorte illimitate" : `Scorte: ${product.stock}`}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => startEditing(product)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Modifica
                  </button>
                  <button type="button" onClick={() => void deleteProduct(product.id)} disabled={loadingId === product.id} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">
                    {loadingId === product.id ? "Eliminazione..." : "Elimina"}
                  </button>
                </div>
              </div>
            )) : (
              <div className="px-6 py-8">
                <EmptyState icon="🛍️" title="Nessun prodotto" description="Crea il primo prodotto per alimentare lo shop pubblico e gli ordini in arrivo." />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Ordini recenti</h2>
          <p className="text-sm text-slate-500">Porta avanti ogni ordine fino alla consegna con controlli chiari.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.length > 0 ? orders.map((order) => {
            const nextStatus = ORDER_STATUS_FLOW[order.status as OrderStatus];
            return (
              <div key={order.id} className="flex flex-col gap-4 px-6 py-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-slate-900">{order.customerName}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_STYLES[order.status] || "bg-slate-100"}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span className="text-xs uppercase tracking-[0.16em] text-slate-400">{order.channel}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{order.itemsSummary.join(", ")} · {new Date(order.createdAt).toLocaleString("it-IT")}</p>
                  {order.notes ? <p className="mt-2 text-sm text-slate-600">Note: {order.notes}</p> : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-slate-900">{formatPrice(order.totalEuro)}</span>
                  {nextStatus ? (
                    <button
                      type="button"
                      onClick={() => void updateOrderStatus(order.id, nextStatus)}
                      disabled={loadingId === order.id}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                    >
                      {loadingId === order.id ? "Aggiornamento..." : `Segna ${ORDER_STATUS_LABELS[nextStatus].toLowerCase()}`}
                    </button>
                  ) : null}
                  {order.status !== "cancellato" && order.status !== "consegnato" ? (
                    <button
                      type="button"
                      onClick={() => void updateOrderStatus(order.id, "cancellato")}
                      disabled={loadingId === order.id}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      Annulla
                    </button>
                  ) : null}
                </div>
              </div>
            );
          }) : (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              Nessun ordine ricevuto. Condividi lo shop pubblico per iniziare.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
