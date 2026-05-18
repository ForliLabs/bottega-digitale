"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";

const BOOKING_STATUSES = ["Confermata", "In attesa", "Completata", "Cancellata"] as const;
const BOOKING_CHANNELS = ["Sito web", "WhatsApp", "Instagram", "Telefono", "Online"] as const;

type PredefinedService = {
  id: string;
  name: string;
  priceEuro: number;
  durationMinutes: number;
};

const CUSTOM_SERVICE_SENTINEL = "__custom__";

type Booking = {
  id: string;
  customerName: string;
  service: string;
  startsAt: string;
  durationMinutes: number;
  status: string;
  channel: string;
  priceEuro: number;
  notes?: string | null;
};

type BookingFormData = {
  customerName: string;
  service: string;
  startsAt: string;
  durationMinutes: number;
  status: string;
  channel: string;
  priceEuro: number;
  notes: string;
};

const emptyForm: BookingFormData = {
  customerName: "",
  service: "",
  startsAt: "",
  durationMinutes: 30,
  status: "Confermata",
  channel: "Sito web",
  priceEuro: 0,
  notes: "",
};

function statusTone(status: string) {
  switch (status) {
    case "Confermata": return "success" as const;
    case "Completata": return "info" as const;
    case "Cancellata": return "error" as const;
    default: return "warning" as const;
  }
}

const dayFormatter = new Intl.DateTimeFormat("it-IT", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
});

function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function BookingsManager({
  initialBookings,
  predefinedServices = [],
}: {
  initialBookings: Booking[];
  predefinedServices?: PredefinedService[];
}) {
  const { notify } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BookingFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  // Tracks whether the service field is in free-text ("custom") mode
  const [serviceMode, setServiceMode] = useState<"predefined" | "custom">(
    predefinedServices.length > 0 ? "predefined" : "custom"
  );

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
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60);
    setForm({
      ...emptyForm,
      startsAt: toLocalDatetimeValue(now.toISOString()),
    });
    setErrors([]);
    setServiceMode(predefinedServices.length > 0 ? "predefined" : "custom");
    setShowForm(true);
  }

  function openEdit(booking: Booking) {
    setEditingId(booking.id);
    setForm({
      customerName: booking.customerName,
      service: booking.service,
      startsAt: toLocalDatetimeValue(booking.startsAt),
      durationMinutes: booking.durationMinutes,
      status: booking.status,
      channel: booking.channel,
      priceEuro: booking.priceEuro,
      notes: booking.notes ?? "",
    });
    setErrors([]);
    // When editing, prefer free-text mode so the existing value is always shown
    setServiceMode("custom");
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
      customerName: form.customerName,
      service: form.service,
      startsAt: new Date(form.startsAt).toISOString(),
      durationMinutes: form.durationMinutes,
      status: form.status,
      channel: form.channel,
      priceEuro: form.priceEuro,
      notes: form.notes || null,
    };

    try {
      const url = editingId ? `/api/bookings/${editingId}` : "/api/bookings";
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
        setBookings((prev) => prev.map((b) => (b.id === editingId ? data : b)));
        notify({ tone: "success", title: "Prenotazione aggiornata" });
      } else {
        setBookings((prev) =>
          [...prev, data].sort(
            (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
          ),
        );
        notify({ tone: "success", title: "Prenotazione creata" });
      }
      closeForm();
    } catch {
      setErrors(["Errore di rete. Riprova."]);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(booking: Booking, newStatus: string) {
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? data : b)));
      notify({ tone: "success", title: `Stato aggiornato: ${newStatus}` });
    } catch {
      notify({ tone: "error", title: "Errore nell'aggiornamento dello stato" });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBookings((prev) => prev.filter((b) => b.id !== id));
      notify({ tone: "success", title: "Prenotazione eliminata" });
    } catch {
      notify({ tone: "error", title: "Errore nella cancellazione" });
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <>
      {/* Confirm dialog for delete */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminare prenotazione?"
        description="Questa azione è irreversibile. La prenotazione verrà rimossa definitivamente."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{bookings.length} prenotazioni</p>
        <button
          onClick={openCreate}
          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          + Nuova prenotazione
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? "Modifica prenotazione" : "Nuova prenotazione"}
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
              <label htmlFor="booking-customerName" className={labelClass}>Nome cliente *</label>
              <input
                id="booking-customerName"
                type="text"
                required
                className={inputClass}
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="booking-service" className={labelClass}>Servizio *</label>
              {predefinedServices.length > 0 && serviceMode === "predefined" ? (
                <div className="space-y-1.5">
                  <select
                    id="booking-service"
                    required
                    className={inputClass}
                    value={
                      predefinedServices.some((s) => s.name === form.service)
                        ? form.service
                        : ""
                    }
                    onChange={(e) => {
                      if (e.target.value === CUSTOM_SERVICE_SENTINEL) {
                        setServiceMode("custom");
                        return;
                      }
                      const svc = predefinedServices.find((s) => s.name === e.target.value);
                      if (svc) {
                        setForm((f) => ({
                          ...f,
                          service: svc.name,
                          durationMinutes: svc.durationMinutes,
                          priceEuro: svc.priceEuro,
                        }));
                      }
                    }}
                  >
                    <option value="" disabled>Seleziona un servizio…</option>
                    {predefinedServices.map((svc) => (
                      <option key={svc.id} value={svc.name}>
                        {svc.name} · {svc.durationMinutes} min · €{svc.priceEuro}
                      </option>
                    ))}
                    <option value={CUSTOM_SERVICE_SENTINEL}>— Inserisci manualmente…</option>
                  </select>
                  <p className="text-xs text-slate-500">
                    Durata e prezzo vengono precompilati in automatico.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <input
                    id="booking-service"
                    type="text"
                    required
                    className={inputClass}
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    placeholder="Es. Taglio capelli"
                  />
                  {predefinedServices.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setServiceMode("predefined")}
                      className="text-xs text-amber-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      ← Scegli dai servizi predefiniti
                    </button>
                  )}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="booking-startsAt" className={labelClass}>Data e ora *</label>
              <input
                id="booking-startsAt"
                type="datetime-local"
                required
                className={inputClass}
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="booking-durationMinutes" className={labelClass}>Durata (minuti)</label>
              <input
                id="booking-durationMinutes"
                type="number"
                min={5}
                max={480}
                className={inputClass}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label htmlFor="booking-status" className={labelClass}>Stato</label>
              <select
                id="booking-status"
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="booking-channel" className={labelClass}>Canale</label>
              <select
                id="booking-channel"
                className={inputClass}
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
              >
                {BOOKING_CHANNELS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="booking-priceEuro" className={labelClass}>Prezzo (€)</label>
              <input
                id="booking-priceEuro"
                type="number"
                min={0}
                step={0.01}
                className={inputClass}
                value={form.priceEuro}
                onChange={(e) =>
                  setForm({ ...form, priceEuro: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label htmlFor="booking-notes" className={labelClass}>Note</label>
              <input
                id="booking-notes"
                type="text"
                className={inputClass}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? "Salvataggio..." : editingId ? "Salva modifiche" : "Crea prenotazione"}
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

      {/* Bookings list */}
      {bookings.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-4xl">📅</p>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Nessuna prenotazione</h3>
          <p className="mt-2 text-sm text-slate-500">
            Crea la prima prenotazione usando il pulsante qui sopra.
          </p>
        </div>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Elenco prenotazioni</h2>
          </div>

          {/* Mobile card layout */}
          <div className="divide-y divide-slate-100 md:hidden">
            {bookings.map((booking) => (
              <div key={booking.id} className="px-5 py-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{booking.customerName}</p>
                    <p className="text-sm text-slate-600">{booking.service}</p>
                    <p className="text-sm text-slate-500">
                      {dayFormatter.format(new Date(booking.startsAt))} ·{" "}
                      {timeFormatter.format(new Date(booking.startsAt))}
                    </p>
                  </div>
                  <StatusBadge tone={statusTone(booking.status)} label={booking.status} />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <select
                    aria-label={`Cambia stato per ${booking.customerName}`}
                    className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    value={booking.status}
                    onChange={(e) => handleStatusChange(booking, e.target.value)}
                  >
                    {BOOKING_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => openEdit(booking)}
                    className="min-h-[44px] rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => setDeleteTarget(booking.id)}
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
              <caption className="sr-only">Elenco prenotazioni</caption>
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">Cliente</th>
                  <th scope="col" className="px-6 py-3 font-medium">Servizio</th>
                  <th scope="col" className="px-6 py-3 font-medium">Quando</th>
                  <th scope="col" className="px-6 py-3 font-medium">Canale</th>
                  <th scope="col" className="px-6 py-3 font-medium">Stato</th>
                  <th scope="col" className="px-6 py-3 font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 font-medium text-slate-900">{booking.customerName}</td>
                    <td className="px-6 py-4">{booking.service}</td>
                    <td className="px-6 py-4">
                      {dayFormatter.format(new Date(booking.startsAt))} ·{" "}
                      {timeFormatter.format(new Date(booking.startsAt))}
                    </td>
                    <td className="px-6 py-4">{booking.channel}</td>
                    <td className="px-6 py-4">
                      <select
                        aria-label={`Cambia stato per ${booking.customerName}`}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking, e.target.value)}
                      >
                        {BOOKING_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(booking)}
                          className="min-h-[36px] rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => setDeleteTarget(booking.id)}
                          className="min-h-[36px] rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
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
