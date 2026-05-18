"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { EmptyState, InlineMessage, Skeleton } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";
import { isValidPhoneNumber } from "@/lib/utils";

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

const STEP_LABELS: Record<Exclude<BookingStep, "confirmed">, string> = {
  service: "Servizio",
  date: "Data",
  time: "Orario",
  details: "Dati",
};

// Static metadata — defined at module level to avoid recreation on every render.
const STEP_ORDER: Exclude<BookingStep, "confirmed">[] = ["service", "date", "time", "details"];

// ── Add-to-calendar helpers ───────────────────────────────────────────────────

/** Format a Date as the compact UTC string Google Calendar / iCal expect: YYYYMMDDTHHMMSSZ */
function toCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Build a Google Calendar "quick-add" URL for the booking. */
function buildGoogleCalendarUrl(service: string, startsAt: string, durationMinutes: number): string {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: service,
    dates: `${toCalendarDate(start)}/${toCalendarDate(end)}`,
    details: "Prenotazione confermata tramite Bottega Digitale.",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Build the raw ICS text for a booking event. */
function buildIcsContent(service: string, startsAt: string, durationMinutes: number): string {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const uid = `booking-${Date.now()}@bottega-digitale`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bottega Digitale//Booking//IT",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toCalendarDate(new Date())}`,
    `DTSTART:${toCalendarDate(start)}`,
    `DTEND:${toCalendarDate(end)}`,
    `SUMMARY:${service}`,
    "DESCRIPTION:Prenotazione confermata tramite Bottega Digitale.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Trigger an .ics download using a Blob URL.
 * Works on Chrome/Firefox/Edge (honours the `download` attribute) and on
 * iOS Safari (which navigates to the blob, sees the text/calendar MIME type
 * and offers to add the event to Calendar instead of downloading).
 * This avoids the `data:` URI approach that Safari blocks for downloads.
 */
function triggerIcsDownload(service: string, startsAt: string, durationMinutes: number) {
  const content = buildIcsContent(service, startsAt, durationMinutes);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "prenotazione.ics";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoke after a generous delay to handle slow iOS navigation.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function AddToCalendar({
  service,
  startsAt,
  durationMinutes,
}: {
  service: string;
  startsAt: string;
  durationMinutes: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Aggiungi al calendario
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <a
          href={buildGoogleCalendarUrl(service, startsAt, durationMinutes)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <span aria-hidden="true">📅</span> Google Calendar
        </a>
        <button
          type="button"
          onClick={() => triggerIcsDownload(service, startsAt, durationMinutes)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <span aria-hidden="true">🗓️</span> Apple / Outlook (.ics)
        </button>
      </div>
    </div>
  );
}

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
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceError, setServiceError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [bookingResult, setBookingResult] = useState<{ id: string; service: string; startsAt: string } | null>(null);
  const [reminderMessage, setReminderMessage] = useState("Ti invieremo i dettagli della prenotazione in questa pagina.");

  // Move focus to the active step heading whenever the step changes so keyboard
  // and screen-reader users always land at the new content without scrolling.
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setServiceLoading(true);
      setServiceError("");
      fetch(`/api/directory?slug=${slug}`)
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Impossibile caricare i servizi");
          }
          if (Array.isArray(data.services)) {
            setServices(data.services);
            return;
          }
          setServices([]);
        })
        .catch((loadError) => {
          setServiceError(loadError instanceof Error ? loadError.message : "Impossibile caricare i servizi");
        })
        .finally(() => setServiceLoading(false));
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [slug]);

  const fetchAvailability = useCallback((duration: number) => {
    setAvailabilityLoading(true);
    setAvailabilityError("");
    fetch(`/api/availability?slug=${slug}&duration=${duration}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Impossibile caricare la disponibilità");
        }
        setAvailability(data.availability || []);
      })
      .catch((loadError) => {
        setAvailability([]);
        setAvailabilityError(loadError instanceof Error ? loadError.message : "Impossibile caricare la disponibilità");
      })
      .finally(() => setAvailabilityLoading(false));
  }, [slug]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedDate("");
    setSelectedSlot(null);
    setError("");
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

  const goToStep = (target: Exclude<BookingStep, "confirmed">) => {
    const currentIdx = STEP_ORDER.indexOf(step as Exclude<BookingStep, "confirmed">);
    const targetIdx = STEP_ORDER.indexOf(target);
    if (targetIdx >= currentIdx) return; // only allow backward navigation
    setError("");
    if (targetIdx === 0) {
      setSelectedDate("");
      setSelectedSlot(null);
    } else if (targetIdx === 1) {
      setSelectedSlot(null);
    }
    setStep(target);
  };

  const handleSubmit = async () => {
    if (!selectedService) {
      setError("Seleziona un servizio prima di continuare.");
      return;
    }
    if (!selectedSlot) {
      setError("Scegli un orario disponibile.");
      return;
    }
    if (!customerName.trim()) {
      setError("Inserisci il tuo nome.");
      return;
    }
    if (customerPhone && !isValidPhoneNumber(customerPhone)) {
      setError("Inserisci un numero di telefono valido oppure lascia il campo vuoto.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/booking-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          startsAt: selectedSlot.start,
          customerName: customerName.trim(),
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
      const hasReminder = Boolean(customerPhone && data.whatsappReminderScheduled);
      setReminderMessage(
        hasReminder
          ? "Riceverai un promemoria via WhatsApp prima dell'appuntamento."
          : customerPhone
            ? "La prenotazione è confermata. Se il negozio attiverà WhatsApp riceverai lì i promemoria."
            : "Prenotazione confermata. Aggiungi il telefono la prossima volta per ricevere un promemoria WhatsApp."
      );
      setStep("confirmed");
      notify({
        tone: "success",
        title: "Prenotazione confermata",
        description: hasReminder
          ? "Ti invieremo un promemoria WhatsApp prima dell'appuntamento."
          : "Controlla i dettagli della prenotazione qui sotto.",
      });
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
        <nav aria-label="Passi della prenotazione" className="mb-8">
          <ol className="flex items-center justify-center gap-2">
            {(STEP_ORDER).map((s, i) => {
              const isCompleted = STEP_ORDER.indexOf(step as Exclude<BookingStep, "confirmed">) > i || step === "confirmed";
              const isCurrent = step === s;
              const canClick = isCompleted && step !== "confirmed";
              // Compute a human-readable state string for screen-reader consumers.
              const stepState = isCurrent ? " (corrente)" : isCompleted ? " (completato)" : " (non ancora raggiunto)";
              return (
                <li key={s} className="flex items-center gap-1">
                  <div className="flex flex-col items-center gap-0.5">
                    {canClick ? (
                      <button
                        type="button"
                        onClick={() => goToStep(s)}
                        aria-label={`Torna al passo ${i + 1}: ${STEP_LABELS[s]} (completato)`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-medium text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1"
                      >
                        <span aria-hidden="true">{i + 1}</span>
                      </button>
                    ) : (
                      <div
                        aria-current={isCurrent ? "step" : undefined}
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                          isCurrent ? "bg-amber-500 text-white" :
                          isCompleted ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        <span className="sr-only">
                          {`Passo ${i + 1}: ${STEP_LABELS[s]}${stepState}`}
                        </span>
                        <span aria-hidden="true">{i + 1}</span>
                      </div>
                    )}
                    <span
                      aria-hidden="true"
                      className={`text-[10px] font-medium leading-none ${
                        isCurrent ? "text-amber-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {STEP_LABELS[s]}
                    </span>
                  </div>
                  {i < 3 && <div className="mb-3 h-0.5 w-5 bg-slate-200" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Step: Service */}
        {step === "service" && (
          <div className="space-y-3">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-semibold text-slate-900 focus:outline-none">Scegli il servizio</h2>
            {serviceLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : serviceError ? (
              <InlineMessage tone="error" title="Servizi non disponibili" description={serviceError} />
            ) : services.length === 0 ? (
              <EmptyState icon="🪑" title="Nessun servizio prenotabile" description="Questa attività non ha ancora pubblicato servizi online. Prova più tardi o contatta direttamente il negozio." />
            ) : (
              services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{service.name}</p>
                      <p className="text-sm text-slate-500">{service.durationMinutes} min</p>
                    </div>
                    <p className="text-lg font-bold text-amber-600">€{service.priceEuro.toFixed(2)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Step: Date */}
        {step === "date" && (
          <div className="space-y-3">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-semibold text-slate-900 focus:outline-none">Scegli il giorno</h2>
            <p className="text-sm text-slate-500">Servizio: <strong>{selectedService?.name}</strong></p>
            {availabilityLoading ? (
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : availabilityError ? (
              <InlineMessage tone="error" title="Disponibilità non caricata" description={availabilityError} />
            ) : daysWithSlots.length === 0 ? (
              <EmptyState icon="🗓️" title="Nessuna data disponibile" description="Non ci sono slot aperti nei prossimi giorni per questo servizio. Riprova più tardi o scegli un altro servizio." />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {daysWithSlots.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => handleDateSelect(day.date)}
                    className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    <p className="text-sm font-medium text-slate-900">{day.dayName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(day.date + "T00:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                    </p>
                    <p className="mt-1 text-xs text-emerald-600">{day.slots.filter((s) => s.available).length} posti</p>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => {
              setSelectedDate("");
              setSelectedSlot(null);
              setStep("service");
            }} className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
              ← Indietro
            </button>
          </div>
        )}

        {/* Step: Time */}
        {step === "time" && (
          <div className="space-y-3">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-semibold text-slate-900 focus:outline-none">Scegli l&apos;orario</h2>
            <p className="text-sm text-slate-500">
              {slotsForDate?.dayName}{" "}
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long" })}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableSlots.map((slot) => {
                const timeLabel = new Date(slot.start).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
                const dateLabel = slotsForDate
                  ? `${slotsForDate.dayName} ${new Date(selectedDate + "T00:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long" })}`
                  : "";
                return (
                  <button
                    key={slot.start}
                    onClick={() => handleSlotSelect(slot)}
                    aria-label={`Prenota ${selectedService?.name ?? ""} alle ${timeLabel} — ${dateLabel}`}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-900 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    {timeLabel}
                  </button>
                );
              })}
            </div>
            {availableSlots.length === 0 ? (
              <InlineMessage tone="info" title="Nessun orario disponibile" description="Scegli un altro giorno o torna più tardi: gli slot si aggiornano automaticamente." />
            ) : null}
            <button onClick={() => {
              setSelectedSlot(null);
              setStep("date");
            }} className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
              ← Indietro
            </button>
          </div>
        )}

        {/* Step: Details */}
        {step === "details" && (
          <div className="space-y-4">
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-semibold text-slate-900 focus:outline-none">I tuoi dati</h2>
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
              <label htmlFor="customer-name" className="block text-sm font-medium text-slate-700">Nome *</label>
              <input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Il tuo nome"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="customer-phone" className="block text-sm font-medium text-slate-700">Telefono</label>
              <input
                id="customer-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="+39 333 1234567"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>

            <div>
              <label htmlFor="booking-notes" className="block text-sm font-medium text-slate-700">Note (opzionale)</label>
              <textarea
                id="booking-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                rows={2}
                placeholder="Richieste particolari..."
              />
            </div>

            <div role="alert" aria-live="polite">
              {error ? <InlineMessage tone="error" title={error} /> : null}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !customerName}
              className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? "Prenotazione in corso..." : "Conferma prenotazione"}
            </button>

            <button onClick={() => {
              setError("");
              setStep("time");
            }} className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
              ← Indietro
            </button>
          </div>
        )}

        {/* Step: Confirmed */}
        {step === "confirmed" && bookingResult && (
          <div className="space-y-4 text-center">
            <div className="text-5xl" aria-hidden="true">✅</div>
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold text-slate-900 focus:outline-none">Prenotazione confermata!</h2>
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
              <p className="mt-2 text-xs text-emerald-600">Codice: {bookingResult.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <p className="text-sm text-slate-500">{reminderMessage}</p>

            {/* Add-to-calendar affordances */}
            <AddToCalendar
              service={bookingResult.service}
              startsAt={bookingResult.startsAt}
              durationMinutes={selectedService?.durationMinutes ?? 60}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  setStep("service");
                  setSelectedDate("");
                  setSelectedSlot(null);
                  setCustomerName("");
                  setCustomerPhone("");
                  setNotes("");
                  setBookingResult(null);
                  setReminderMessage("Ti invieremo i dettagli della prenotazione in questa pagina.");
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Nuova prenotazione
              </button>
              <Link href={`/s/${slug}`} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                Torna alla vetrina
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
