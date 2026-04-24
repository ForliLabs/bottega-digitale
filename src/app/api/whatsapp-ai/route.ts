import { prisma } from "@/lib/prisma";
import { handleInboundMessage } from "@/lib/whatsapp-ai";
import { sendTextMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

// Webhook for inbound WhatsApp messages → AI processing
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { businessId, phone, message } = payload;

    if (!businessId || !phone || !message) {
      return Response.json(
        { error: "Campi obbligatori: businessId, phone, message" },
        { status: 400 }
      );
    }

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
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (business?.whatsappPhoneId) {
      await sendTextMessage(business.whatsappPhoneId, phone, reply).catch(() => {});
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
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return Response.json({ error: "businessId richiesto" }, { status: 400 });
  }

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
