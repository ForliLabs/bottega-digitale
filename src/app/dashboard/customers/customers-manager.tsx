"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  lastVisit: string;
  totalVisits: number;
  loyaltyPoints: number;
};

type CustomerFormData = {
  name: string;
  phone: string;
  email: string;
  totalVisits: number;
  loyaltyPoints: number;
};

const emptyForm: CustomerFormData = {
  name: "",
  phone: "",
  email: "",
  totalVisits: 1,
  loyaltyPoints: 0,
};

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function CustomersManager({ initialCustomers }: { initialCustomers: Customer[] }) {
  const { notify } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Confirm dialog state
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Ref for error summary to focus on validation errors
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Focus error summary when errors appear
  useEffect(() => {
    if (errors.length > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [errors]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors([]);
    setShowForm(true);
  }

  function openEdit(customer: Customer) {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? "",
      totalVisits: customer.totalVisits,
      loyaltyPoints: customer.loyaltyPoints,
    });
    setErrors([]);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const body = {
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      totalVisits: form.totalVisits,
      loyaltyPoints: form.loyaltyPoints,
    };

    try {
      const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setErrors(data.details.map((d: { message: string }) => d.message));
        } else {
          setErrors([data.error || "Errore sconosciuto"]);
        }
        return;
      }

      if (editingId) {
        setCustomers((prev) => prev.map((c) => (c.id === editingId ? data : c)));
        notify({ tone: "success", title: "Cliente aggiornato" });
      } else {
        setCustomers((prev) =>
          [...prev, data].sort(
            (a, b) => Date.parse(b.lastVisit) - Date.parse(a.lastVisit),
          ),
        );
        notify({ tone: "success", title: "Cliente creato" });
      }
      closeForm();
    } catch {
      setErrors(["Errore di rete. Riprova."]);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      notify({ tone: "success", title: "Cliente eliminato" });
    } catch {
      notify({ tone: "error", title: "Errore nella cancellazione" });
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  const averageVisits =
    customers.length > 0
      ? (customers.reduce((t, c) => t + c.totalVisits, 0) / customers.length).toFixed(1)
      : "0.0";
  const totalPoints = customers.reduce((t, c) => t + c.loyaltyPoints, 0);

  return (
    <>
      {/* Confirm dialog for delete */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminare questo cliente?"
        description="L'operazione non è reversibile. Il cliente e i relativi dati verranno rimossi definitivamente."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Clienti salvati</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{customers.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Visite medie</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{averageVisits}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Punti fedeltà totali</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalPoints}</p>
        </div>
      </section>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{customers.length} clienti</p>
        <button
          onClick={openCreate}
          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          + Nuovo cliente
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? "Modifica cliente" : "Nuovo cliente"}
          </h3>
          {errors.length > 0 && (
            <div
              ref={errorSummaryRef}
              role="alert"
              aria-label="Errori nel modulo"
              tabIndex={-1}
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <p className="font-semibold mb-1">Correggi i seguenti errori:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="customer-name" className={labelClass}>Nome *</label>
              <input
                id="customer-name"
                type="text"
                required
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="customer-phone" className={labelClass}>Telefono *</label>
              <input
                id="customer-phone"
                type="tel"
                required
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="customer-email" className={labelClass}>Email</label>
              <input
                id="customer-email"
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="customer-totalVisits" className={labelClass}>Visite totali</label>
              <input
                id="customer-totalVisits"
                type="number"
                min={0}
                className={inputClass}
                value={form.totalVisits}
                onChange={(e) =>
                  setForm({ ...form, totalVisits: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label htmlFor="customer-loyaltyPoints" className={labelClass}>Punti fedeltà</label>
              <input
                id="customer-loyaltyPoints"
                type="number"
                min={0}
                className={inputClass}
                value={form.loyaltyPoints}
                onChange={(e) =>
                  setForm({ ...form, loyaltyPoints: Number(e.target.value) })
                }
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? "Salvataggio..." : editingId ? "Salva modifiche" : "Crea cliente"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annulla
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Customers list */}
      {customers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-4xl">👥</p>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Il CRM è ancora vuoto</h3>
          <p className="mt-2 text-sm text-slate-500">
            Aggiungi il primo cliente usando il pulsante qui sopra.
          </p>
        </div>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Elenco clienti</h2>
            <p className="text-sm text-slate-500">Contatti pronti per promemoria, offerte e campagne fedeltà.</p>
          </div>

          {/* Mobile card layout */}
          <div className="divide-y divide-slate-100 md:hidden">
            {customers.map((customer) => (
              <div key={customer.id} className="px-5 py-4 space-y-2">
                <p className="font-medium text-slate-900">{customer.name}</p>
                <p className="text-sm text-slate-600">{customer.phone}</p>
                {customer.email && <p className="text-sm text-slate-500">{customer.email}</p>}
                <p className="text-sm text-slate-500">
                  Ultima visita: {dateFormatter.format(new Date(customer.lastVisit))}
                </p>
                <div className="flex items-center gap-3 pt-1 text-sm">
                  <span className="text-slate-500">{customer.totalVisits} visite</span>
                  <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
                    {customer.loyaltyPoints} punti
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => openEdit(customer)}
                    className="min-h-[44px] rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => setDeleteTarget(customer.id)}
                    className="min-h-[44px] rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <caption className="sr-only">Elenco clienti della bottega</caption>
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">Nome</th>
                  <th scope="col" className="px-6 py-3 font-medium">Telefono</th>
                  <th scope="col" className="px-6 py-3 font-medium">Email</th>
                  <th scope="col" className="px-6 py-3 font-medium">Ultima visita</th>
                  <th scope="col" className="px-6 py-3 font-medium">Visite</th>
                  <th scope="col" className="px-6 py-3 font-medium">Punti</th>
                  <th scope="col" className="px-6 py-3 font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                    <td className="px-6 py-4">{customer.phone}</td>
                    <td className="px-6 py-4 text-slate-500">{customer.email || "—"}</td>
                    <td className="px-6 py-4">{dateFormatter.format(new Date(customer.lastVisit))}</td>
                    <td className="px-6 py-4">{customer.totalVisits}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {customer.loyaltyPoints}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(customer)}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => setDeleteTarget(customer.id)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
