/**
 * @module notifications
 * Unified notification center that consolidates events from all modules
 * into a single activity feed, grouped by time period.
 *
 * Provides convenience creators for common events (new booking, payment,
 * review, loyalty reward, order) and a feed API that groups notifications
 * by "Oggi", "Ieri", "Questa settimana", and "Precedenti".
 *
 * @example
 * ```ts
 * // Create a notification for a new booking
 * await notify.newBooking(businessId, "Marco", "Taglio uomo", "15 Gen");
 *
 * // Get grouped feed
 * const feed = await getNotificationFeed(businessId);
 * // => { "Oggi": [...], "Ieri": [...], ... }
 *
 * // Mark all as read
 * await markAllAsRead(businessId);
 * ```
 */

// Notification Center Service
// Consolidates events from all modules into a unified activity feed

import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/lib/notifications-ui";
export { NOTIFICATION_COLORS, NOTIFICATION_ICONS } from "@/lib/notifications-ui";
export type { NotificationType } from "@/lib/notifications-ui";

// ─── Create Notifications ───────────────────────────────────────

export async function createNotification(params: {
  businessId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  priority?: "low" | "normal" | "urgent";
}) {
  return prisma.notification.create({
    data: {
      businessId: params.businessId,
      type: params.type,
      title: params.title,
      body: params.body,
      actionUrl: params.actionUrl,
      priority: params.priority || "normal",
    },
  });
}

// Convenience creators for common events
export const notify = {
  newBooking: (businessId: string, customerName: string, service: string, date: string) =>
    createNotification({
      businessId,
      type: "booking",
      title: "Nuova prenotazione",
      body: `${customerName} ha prenotato ${service} per ${date}`,
      actionUrl: "/dashboard/bookings",
      priority: "urgent",
    }),

  paymentReceived: (businessId: string, amount: number, customerName: string) =>
    createNotification({
      businessId,
      type: "payment",
      title: "Pagamento ricevuto",
      body: `€${amount.toFixed(2)} da ${customerName}`,
      actionUrl: "/dashboard/payments",
      priority: "urgent",
    }),

  newReview: (businessId: string, author: string, rating: number) =>
    createNotification({
      businessId,
      type: "review",
      title: "Nuova recensione",
      body: `${author} ha lasciato ${rating} ★`,
      actionUrl: "/dashboard/reviews",
    }),

  loyaltyReward: (businessId: string, customerName: string) =>
    createNotification({
      businessId,
      type: "loyalty",
      title: "Premio raggiunto",
      body: `${customerName} ha raggiunto il premio fedeltà!`,
      actionUrl: "/dashboard/loyalty",
    }),

  newOrder: (businessId: string, customerName: string, total: number) =>
    createNotification({
      businessId,
      type: "order",
      title: "Nuovo ordine",
      body: `${customerName} — €${total.toFixed(2)}`,
      actionUrl: "/dashboard/products",
      priority: "urgent",
    }),
};

// ─── Fetch & Manage Notifications ───────────────────────────────

export async function getNotificationFeed(businessId: string, limit = 50) {
  const notifications = await prisma.notification.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Group by day
  const grouped: Record<string, typeof notifications> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  for (const n of notifications) {
    const date = new Date(n.createdAt);
    let group: string;
    if (date >= today) group = "Oggi";
    else if (date >= yesterday) group = "Ieri";
    else if (date >= weekAgo) group = "Questa settimana";
    else group = "Precedenti";

    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(n);
  }

  return grouped;
}

export async function getUnreadCount(businessId: string) {
  return prisma.notification.count({
    where: { businessId, read: false },
  });
}

export async function markAllAsRead(businessId: string) {
  return prisma.notification.updateMany({
    where: { businessId, read: false },
    data: { read: true },
  });
}

export async function markAsRead(notificationId: string, businessId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, businessId },
    data: { read: true },
  });
}

// ─── Notification Preferences ───────────────────────────────────

export interface NotificationPreferences {
  pushEnabled: boolean;
  whatsappDigest: boolean;
  emailSummary: boolean;
  urgentOnly: boolean;
  maxPushPerDay: number;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  whatsappDigest: true,
  emailSummary: false,
  urgentOnly: false,
  maxPushPerDay: 5,
};
