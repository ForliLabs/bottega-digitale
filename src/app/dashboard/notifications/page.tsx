export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { getNotificationFeed, getUnreadCount } from "@/lib/notifications";
import { NotificationsClient } from "./notifications-client";

export default async function NotificationsPage() {
  const business = await getBusinessContext();
  const feed = business ? await getNotificationFeed(business.id) : {};
  const unreadCount = business ? await getUnreadCount(business.id) : 0;

  const groups = Object.entries(feed).map(([label, notifications]) => ({
    label,
    notifications: notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      actionUrl: notification.actionUrl,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
    })),
  }));

  return <NotificationsClient initialGroups={groups} initialUnreadCount={unreadCount} />;
}
