import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { getNotificationFeed, getUnreadCount, markAllAsRead, markAsRead } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  const [feed, unreadCount] = await Promise.all([
    getNotificationFeed(business.id),
    getUnreadCount(business.id),
  ]);

  return apiJson({ feed, unreadCount });
}

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const business = await requireBusinessContext();
    if (!business) {
      return apiError("Autenticazione richiesta", 401, "unauthorized");
    }

    const payload = await request.json();

    if (payload.action === "mark_all_read") {
      await markAllAsRead(business.id);
      return apiJson({ success: true });
    }

    if (payload.action === "mark_read" && payload.notificationId) {
      const result = await markAsRead(payload.notificationId, business.id);
      if (result.count === 0) {
        return apiError("Notifica non trovata", 404, "notification_not_found");
      }
      return apiJson({ success: true });
    }

    return apiError("Azione non valida", 400, "invalid_action");
  } catch {
    return apiError("Errore nella gestione delle notifiche.", 500, "notifications_failed");
  }
}
