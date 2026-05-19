export type NotificationType =
  | "booking"
  | "payment"
  | "review"
  | "loyalty"
  | "queue"
  | "automation"
  | "order"
  | "system";

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  booking: "📅",
  payment: "💳",
  review: "⭐",
  loyalty: "🏷️",
  queue: "🎟️",
  automation: "⚡",
  order: "🛍️",
  system: "🔔",
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  booking: "bg-blue-100 text-blue-700",
  payment: "bg-green-100 text-green-700",
  review: "bg-amber-100 text-amber-700",
  loyalty: "bg-purple-100 text-purple-700",
  queue: "bg-cyan-100 text-cyan-700",
  automation: "bg-orange-100 text-orange-700",
  order: "bg-pink-100 text-pink-700",
  system: "bg-slate-100 text-slate-700",
};
