import { prisma } from "@/lib/prisma";
import { handleInboundMessage } from "@/lib/whatsapp-ai";
import { sendTextMessage } from "@/lib/whatsapp";
import { requireBusinessContext } from "@/lib/auth";
import { apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// Webhook for inbound WhatsApp messages → AI processing
export async function POST(request: Request) {
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  try {
    const payload = await request.json();
    const { phone, message } = payload;

    if (!phone || !message) {
      return Response.json(
        { error: "Campi obbligatori: phone, message" },
        { status: 400 }
      );
    }

    const businessId = business.id;

    // Log inbound message
    await prisma.whatsappMessage.create({
      data: {
        businessId,
        direction: "inbound",
        phone,
        body: message,
        status: "delivered",
      },
    });

    // Process with AI
    const reply = await handleInboundMessage(businessId, phone, message);

    // Log outbound response
    await prisma.whatsappMessage.create({
      data: {
        businessId,
        direction: "outbound",
        phone,
        body: reply,
        status: "sent",
        templateId: "ai_response",
      },
    });

    // Send via WhatsApp API if configured
    if (business.whatsappPhoneId) {
      await sendTextMessage(business.whatsappPhoneId, phone, reply).catch((err) => {
        console.error("[whatsapp-ai] Failed to send reply via WhatsApp API:", err);
      });
    }

    return Response.json({ reply, status: "sent" });
  } catch {
    return Response.json(
      { error: "Errore nel processamento del messaggio." },
      { status: 500 }
    );
  }
}

// Get conversation stats
export async function GET() {
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  const businessId = business.id;

  const stats = await prisma.whatsappMessage.groupBy({
    by: ["direction"],
    where: { businessId },
    _count: true,
  });

  const activeConversations = await prisma.conversationState.count({
    where: { businessId, expiresAt: { gte: new Date() } },
  });

  return Response.json({
    messages: stats,
    activeConversations,
  });
}
