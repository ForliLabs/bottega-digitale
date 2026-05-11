"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

interface StaffNotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  actionUrl: string | null;
  read: boolean;
  priority: string;
  type: string;
}

export function StaffNotificationsClient({ initialNotifications }: { initialNotifications: StaffNotificationItem[] }) {
  const { notify } = useToast();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "urgent">("unread");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.read);
    }
    if (filter === "urgent") {
      return notifications.filter((notification) => notification.priority === "urgent");
    }
    return notifications;
  }, [filter, notifications]);

  async function markNotificationAsRead(notificationId: string) {
    setLoadingId(notificationId);
    setError("");
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", notificationId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile aggiornare la notifica.");
      }
      setNotifications((current) => current.map((notification) => notification.id === notificationId ? { ...notification, read: true } : notification));
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : "Impossibile aggiornare la notifica.");
    } finally {
      setLoadingId(null);
    }
  }

  async function markAllRead() {
    setLoadingId("all");
    setError("");
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile segnare tutto come letto.");
      }
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
      notify({ tone: "success", title: "Tutte le notifiche sono state aggiornate" });
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : "Impossibile segnare tutto come letto.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Centro notifiche</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Aggiornamenti staff</h1>
            <p className="mt-1 text-sm text-slate-500">Filtra gli alert del turno e segna quelli già gestiti.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "unread", label: `Da leggere (${unreadCount})` },
              { id: "urgent", label: "Urgenti" },
              { id: "all", label: "Tutte" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id as "all" | "unread" | "urgent")}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === item.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={unreadCount === 0 || loadingId === "all"}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              {loadingId === "all" ? "Aggiornamento..." : "Segna tutto letto"}
            </button>
          </div>
        </div>
      </div>

      {error ? <InlineMessage tone="error" title={error} /> : null}

      {filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-3xl">🔕</p>
          <p className="mt-3 text-sm font-semibold text-slate-900">Nessuna notifica in questa vista</p>
          <p className="mt-1 text-sm text-slate-500">Passa a “Tutte” per rivedere lo storico o attendi i prossimi alert.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div key={notification.id} className={`rounded-2xl border p-4 shadow-sm ${notification.read ? "border-slate-200 bg-white" : "border-violet-200 bg-violet-50/40"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{notification.title}</p>
                    {!notification.read ? <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Nuova</span> : null}
                    {notification.priority === "urgent" ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">Urgente</span> : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{notification.body}</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {!notification.read ? (
                  <button
                    type="button"
                    onClick={() => void markNotificationAsRead(notification.id)}
                    disabled={loadingId === notification.id}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {loadingId === notification.id ? "Aggiornamento..." : "Segna come letta"}
                  </button>
                ) : null}
                {notification.actionUrl ? (
                  <Link href={notification.actionUrl} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Apri dettaglio
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
