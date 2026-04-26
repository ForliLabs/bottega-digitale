import { getBusinessContext } from "@/lib/auth";
import { getNotificationFeed, getUnreadCount, markAllAsRead, markAsRead } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await getBusinessContext();
  if (!business) {
    return Response.json({ error: "Attività non trovata" }, { status: 404 });
  }

  const [feed, unreadCount] = await Promise.all([
    getNotificationFeed(business.id),
    getUnreadCount(business.id),
  ]);

  return Response.json({ feed, unreadCount });
}

export async function POST(request: Request) {
  try {
    const business = await getBusinessContext();
    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
    }

    const payload = await request.json();

    if (payload.action === "mark_all_read") {
      await markAllAsRead(business.id);
      return Response.json({ success: true });
    }

    if (payload.action === "mark_read" && payload.notificationId) {
      await markAsRead(payload.notificationId);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Azione non valida" }, { status: 400 });
  } catch {
    return Response.json(
      { error: "Errore nella gestione delle notifiche." },
      { status: 400 }
    );
  }
}
