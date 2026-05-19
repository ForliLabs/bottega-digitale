"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";
import { NOTIFICATION_ICONS, NOTIFICATION_COLORS, type NotificationType } from "@/lib/notifications-ui";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationGroup {
  label: string;
  notifications: NotificationItem[];
}

export function NotificationsClient({
  initialGroups,
  initialUnreadCount,
}: {
  initialGroups: NotificationGroup[];
  initialUnreadCount: number;
}) {
  const { notify } = useToast();
  const [groups, setGroups] = useState(initialGroups);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loading, setLoading] = useState<"all" | string | null>(null);
  const [error, setError] = useState("");

  const totalNotifications = useMemo(
    () => groups.reduce((sum, group) => sum + group.notifications.length, 0),
    [groups],
  );

  async function submitAction(payload: { action: "mark_all_read" } | { action: "mark_read"; notificationId: string }) {
    setLoading(payload.action === "mark_all_read" ? "all" : payload.notificationId);
    setError("");
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile aggiornare le notifiche");
      }

      if (payload.action === "mark_all_read") {
        setGroups((current) => current.map((group) => ({
          ...group,
          notifications: group.notifications.map((notification) => ({ ...notification, read: true })),
        })));
        setUnreadCount(0);
        notify({ tone: "success", title: "Tutte le notifiche sono state segnate come lette" });
      } else {
        setGroups((current) => current.map((group) => ({
          ...group,
          notifications: group.notifications.map((notification) =>
            notification.id === payload.notificationId
              ? { ...notification, read: true }
              : notification,
          ),
        })));
        setUnreadCount((current) => Math.max(current - 1, 0));
        notify({ tone: "success", title: "Notifica aggiornata" });
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Impossibile aggiornare le notifiche");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-purple-50 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
              Centro Notifiche
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Attività recenti
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Tutte le attività della tua bottega in un unico feed: prenotazioni, pagamenti,
              recensioni, ordini e altro.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-xs text-white">
                  {unreadCount}
                </span>
                da leggere
              </span>
            )}
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void submitAction({ action: "mark_all_read" })}
                disabled={loading === "all"}
                className="rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
              >
                {loading === "all" ? "Aggiornamento..." : "Segna tutte come lette"}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <p role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">{error}</p>
      {error ? <InlineMessage tone="error" title={error} silent /> : null}

      <section className="grid grid-cols-2 gap-3 lg:hidden">
        <Link href="/dashboard/bookings" className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm active:scale-95">
          <span className="text-2xl">📅</span>
          <p className="mt-1 text-xs font-medium text-slate-700">Prenotazioni</p>
        </Link>
        <Link href="/dashboard/customers" className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm active:scale-95">
          <span className="text-2xl">👥</span>
          <p className="mt-1 text-xs font-medium text-slate-700">Clienti</p>
        </Link>
        <Link href="/dashboard/loyalty" className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm active:scale-95">
          <span className="text-2xl">🏷️</span>
          <p className="mt-1 text-xs font-medium text-slate-700">Fedeltà</p>
        </Link>
        <Link href="/dashboard/products" className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm active:scale-95">
          <span className="text-2xl">🛍️</span>
          <p className="mt-1 text-xs font-medium text-slate-700">Prodotti</p>
        </Link>
      </section>

      {totalNotifications === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-3xl">🔔</p>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Nessuna notifica</h3>
          <p className="mt-2 text-sm text-slate-500">
            Le notifiche appariranno qui quando ci saranno nuove attività.
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.label}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
              {group.label}
            </h2>
            <div className="space-y-2">
              {group.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-colors ${
                    notification.read
                      ? "border-slate-100"
                      : "border-violet-200 bg-violet-50/30"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                      NOTIFICATION_COLORS[notification.type as NotificationType] || "bg-slate-100"
                    }`}
                  >
                    {NOTIFICATION_ICONS[notification.type as NotificationType] || "🔔"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900">{notification.title}</p>
                      <time className="shrink-0 text-xs text-slate-400">
                        {new Date(notification.createdAt).toLocaleTimeString("it-IT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">{notification.body}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {notification.actionUrl ? (
                        <Link href={notification.actionUrl} className="inline-block text-xs font-medium text-violet-600 hover:text-violet-800">
                          Vai →
                        </Link>
                      ) : null}
                      {!notification.read ? (
                        <button
                          type="button"
                          onClick={() => void submitAction({ action: "mark_read", notificationId: notification.id })}
                          disabled={loading === notification.id}
                          className="rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
                        >
                          {loading === notification.id ? "Aggiornamento..." : "Segna come letta"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {!notification.read && (
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:hidden">
        <h3 className="font-semibold text-slate-900">Dashboard mobile</h3>
        <p className="mt-2 text-sm text-slate-500">
          Usa il menu in alto per navigare. Scorri a sinistra sulle prenotazioni per confermare o cancellare rapidamente.
          Le notifiche push ti avvisano in tempo reale.
        </p>
      </div>
    </div>
  );
}
