"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface DayAvailability {
  date: string;
  dayName: string;
  slots: TimeSlot[];
}

interface Service {
  id: string;
  name: string;
  priceEuro: number;
  durationMinutes: number;
}

type BookingStep = "service" | "date" | "time" | "details" | "confirmed";

export default function BookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [step, setStep] = useState<BookingStep>("service");
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingResult, setBookingResult] = useState<{ id: string; service: string; startsAt: string } | null>(null);

  useEffect(() => {
    fetch(`/api/directory?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.services) setServices(data.services);
      })
      .catch(() => {});
  }, [slug]);

  const fetchAvailability = useCallback((duration: number) => {
    fetch(`/api/availability?slug=${slug}&duration=${duration}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.availability) setAvailability(data.availability);
      })
      .catch(() => {});
  }, [slug]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    fetchAvailability(service.durationMinutes);
    setStep("date");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setStep("time");
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!selectedSlot || !customerName) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/booking-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          serviceId: selectedService?.id,
          serviceName: selectedService?.name,
          startsAt: selectedSlot.start,
          customerName,
          customerPhone: customerPhone || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore nella prenotazione");
        return;
      }

      setBookingResult(data.booking);
      setStep("confirmed");
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const slotsForDate = availability.find((d) => d.date === selectedDate);
  const availableSlots = slotsForDate?.slots.filter((s) => s.available) || [];
  const daysWithSlots = availability.filter((d) => d.slots.some((s) => s.available));

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Prenota Online</h1>
          <p className="mt-1 text-sm text-slate-500">Scegli il servizio, il giorno e l&apos;ora</p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {(["service", "date", "time", "details"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === s ? "bg-amber-500 text-white" :
                (["service", "date", "time", "details"].indexOf(step) > i || step === "confirmed")
                  ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
              }`}>
                {i + 1}
              </div>
              {i < 3 && <div className="h-0.5 w-6 bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* Step: Service */}
        {step === "service" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Scegli il servizio</h2>
            {services.length === 0 && (
              <p className="text-sm text-slate-400">Caricamento servizi...</p>
            )}
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{service.name}</p>
                    <p className="text-sm text-slate-500">{service.durationMinutes} min</p>
                  </div>
                  <p className="text-lg font-bold text-amber-600">€{service.priceEuro.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step: Date */}
        {step === "date" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Scegli il giorno</h2>
            <p className="text-sm text-slate-500">
              Servizio: <strong>{selectedService?.name}</strong>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {daysWithSlots.map((day) => (
                <button
                  key={day.date}
                  onClick={() => handleDateSelect(day.date)}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:border-amber-300"
                >
                  <p className="text-sm font-medium text-slate-900">{day.dayName}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(day.date + "T00:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                  </p>
                  <p className="mt-1 text-xs text-emerald-600">
                    {day.slots.filter((s) => s.available).length} posti
                  </p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep("service")} className="text-sm text-slate-500 hover:text-slate-700">
              ← Indietro
            </button>
          </div>
        )}

        {/* Step: Time */}
        {step === "time" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Scegli l&apos;orario</h2>
            <p className="text-sm text-slate-500">
              {slotsForDate?.dayName}{" "}
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long" })}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.start}
                  onClick={() => handleSlotSelect(slot)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-900 shadow-sm transition hover:border-amber-300 hover:bg-amber-50"
                >
                  {new Date(slot.start).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                </button>
              ))}
            </div>
            {availableSlots.length === 0 && (
              <p className="text-sm text-slate-400">Nessun orario disponibile per questa data.</p>
            )}
            <button onClick={() => setStep("date")} className="text-sm text-slate-500 hover:text-slate-700">
              ← Indietro
            </button>
          </div>
        )}

        {/* Step: Details */}
        {step === "details" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">I tuoi dati</h2>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
              <p><strong>{selectedService?.name}</strong></p>
              <p>
                {selectedSlot && new Date(selectedSlot.start).toLocaleDateString("it-IT", {
                  weekday: "long", day: "numeric", month: "long"
                })}{" "}
                alle{" "}
                {selectedSlot && new Date(selectedSlot.start).toLocaleTimeString("it-IT", {
                  hour: "2-digit", minute: "2-digit"
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Nome *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Il tuo nome"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Telefono</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="+39 333 1234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Note (opzionale)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                rows={2}
                placeholder="Richieste particolari..."
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !customerName}
              className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? "Prenotazione in corso..." : "Conferma prenotazione"}
            </button>

            <button onClick={() => setStep("time")} className="text-sm text-slate-500 hover:text-slate-700">
              ← Indietro
            </button>
          </div>
        )}

        {/* Step: Confirmed */}
        {step === "confirmed" && bookingResult && (
          <div className="space-y-4 text-center">
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-bold text-slate-900">Prenotazione confermata!</h2>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-left">
              <p><strong>Servizio:</strong> {bookingResult.service}</p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(bookingResult.startsAt).toLocaleDateString("it-IT", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric"
                })}
              </p>
              <p>
                <strong>Ora:</strong>{" "}
                {new Date(bookingResult.startsAt).toLocaleTimeString("it-IT", {
                  hour: "2-digit", minute: "2-digit"
                })}
              </p>
              <p className="mt-2 text-xs text-emerald-600">
                Codice: {bookingResult.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <p className="text-sm text-slate-500">
              Riceverai un promemoria via WhatsApp prima dell&apos;appuntamento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
