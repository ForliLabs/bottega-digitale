"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  totalVisits: number;
  notifyWhatsApp: boolean;
  notifyPush: boolean;
}

interface Booking {
  id: string;
  service: string;
  startsAt: string;
  status: string;
  customerName: string;
}

interface LoyaltyCard {
  id: string;
  points: number;
  totalEarned: number;
  business: { name: string; loyaltyRewardThreshold: number; loyaltyRewardName: string };
}

type PortalView = "login" | "otp" | "dashboard";

export default function CustomerPortalPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [view, setView] = useState<PortalView>("login");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [token, setToken] = useState("");
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loyaltyCards, setLoyaltyCards] = useState<LoyaltyCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check for existing token in localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`customer_token_${slug}`);
    if (saved) {
      setToken(saved);
      setView("dashboard");
    }
  }, [slug]);

  const fetchDashboard = useCallback(async (t: string) => {
    try {
      const res = await fetch("/api/customer-auth", {
        headers: { "x-customer-token": t },
      });
      if (!res.ok) {
        localStorage.removeItem(`customer_token_${slug}`);
        setView("login");
        return;
      }
      const data = await res.json();
      setCustomer(data.customer);
      setBookings(data.bookings);
      setLoyaltyCards(data.loyaltyCards);
    } catch {
      setError("Errore di connessione");
    }
  }, [slug]);

  useEffect(() => {
    if (token && view === "dashboard") {
      fetchDashboard(token);
    }
  }, [token, view, fetchDashboard]);

  const handleRequestOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/customer-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-otp", slug, phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSessionId(data.sessionId);
      setView("otp");
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/customer-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", sessionId, otpCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setToken(data.token);
      localStorage.setItem(`customer_token_${slug}`, data.token);
      setView("dashboard");
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.startsAt) > new Date() && b.status !== "Cancellata"
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.startsAt) <= new Date() || b.status === "Completata"
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Area Clienti</h1>
          <p className="mt-1 text-sm text-slate-500">Il tuo spazio personale</p>
        </div>

        {/* Login */}
        {view === "login" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Accedi con il telefono</h2>
            <p className="mt-1 text-sm text-slate-500">
              Riceverai un codice di verifica via WhatsApp.
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="+39 333 1234567"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button
              onClick={handleRequestOTP}
              disabled={loading || !phone}
              className="mt-4 w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? "Invio codice..." : "Invia codice WhatsApp"}
            </button>
          </div>
        )}

        {/* OTP verification */}
        {view === "otp" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Inserisci il codice</h2>
            <p className="mt-1 text-sm text-slate-500">
              Abbiamo inviato un codice a 6 cifre al tuo WhatsApp.
            </p>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-3 text-center text-2xl tracking-[0.5em] focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="______"
              maxLength={6}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button
              onClick={handleVerifyOTP}
              disabled={loading || otpCode.length !== 6}
              className="mt-4 w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? "Verifica..." : "Verifica codice"}
            </button>
            <button onClick={() => setView("login")} className="mt-2 w-full text-sm text-slate-500">
              ← Cambia numero
            </button>
          </div>
        )}

        {/* Customer dashboard */}
        {view === "dashboard" && customer && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6">
              <p className="text-sm text-slate-500">Benvenuto</p>
              <h2 className="text-xl font-bold text-slate-900">{customer.name}</h2>
              <p className="text-sm text-slate-500">{customer.phone} · {customer.totalVisits} visite</p>
            </div>

            {/* Loyalty */}
            {loyaltyCards.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">🏷️ Carta Fedeltà</h3>
                {loyaltyCards.map((card) => {
                  const pct = Math.min((card.points / card.business.loyaltyRewardThreshold) * 100, 100);
                  return (
                    <div key={card.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-medium text-slate-900">{card.business.name}</p>
                      <div className="mt-2 h-3 rounded-full bg-slate-100">
                        <div className="h-3 rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {card.points}/{card.business.loyaltyRewardThreshold} punti
                        {pct >= 100 && ` — 🎁 ${card.business.loyaltyRewardName}!`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upcoming bookings */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">📅 Prossimi appuntamenti</h3>
              {upcomingBookings.length === 0 && (
                <p className="text-sm text-slate-400">Nessun appuntamento in programma.</p>
              )}
              {upcomingBookings.map((b) => (
                <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="font-medium text-slate-900">{b.service}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(b.startsAt).toLocaleDateString("it-IT", {
                      weekday: "long", day: "numeric", month: "long"
                    })}{" "}
                    alle{" "}
                    {new Date(b.startsAt).toLocaleTimeString("it-IT", {
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    b.status === "Confermata" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Past bookings */}
            {pastBookings.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">📋 Visite precedenti</h3>
                {pastBookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-700">{b.service}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(b.startsAt).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick rebook */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-sm font-medium text-slate-900">Vuoi prenotare di nuovo?</p>
              <a
                href={`/book/${slug}`}
                className="mt-2 inline-block rounded-lg bg-amber-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                Prenota online →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
