// Server-Sent Events Stream Endpoint
// Provides real-time updates to the dashboard via SSE
import { getAuthContext } from "@/lib/auth";
import {
  broadcaster,
  formatSSEMessage,
  formatSSEHeartbeat,
  HEARTBEAT_INTERVAL_MS,
} from "@/lib/realtime";
import type { RealtimeEvent } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return new Response("Non autorizzato", { status: 401 });
  }

  const businessId = auth.business.id;
  const { searchParams } = new URL(request.url);
  const lastEventId = searchParams.get("lastEventId");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const connectMsg = `data: ${JSON.stringify({ type: "connected", businessId, lastEventId })}\n\n`;
      controller.enqueue(encoder.encode(connectMsg));

      // Register for events
      const cleanup = broadcaster.addConnection(businessId, (event: RealtimeEvent) => {
        try {
          controller.enqueue(encoder.encode(formatSSEMessage(event)));
        } catch {
          cleanup();
        }
      });

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(formatSSEHeartbeat()));
        } catch {
          clearInterval(heartbeat);
          cleanup();
        }
      }, HEARTBEAT_INTERVAL_MS);

      // Cleanup on abort
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        cleanup();
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
