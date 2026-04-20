import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { sendTextMessage, sendTemplateMessage, isWhatsAppConfigured } from "@/lib/whatsapp";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return Response.json({ error: "Non autenticato." }, { status: 401 });
  }

  if (!isWhatsAppConfigured()) {
    return Response.json(
      { error: "WhatsApp non configurato. Imposta WHATSAPP_TOKEN e il numero di telefono nelle impostazioni." },
      { status: 503 }
    );
  }

  try {
    const { to, body, templateName, templateParams } = await request.json();
    if (!to || (!body && !templateName)) {
      return Response.json({ error: "Destinatario e messaggio sono obbligatori." }, { status: 400 });
    }

    const phoneId = auth.business.whatsappPhoneId;
    if (!phoneId) {
      return Response.json({ error: "WhatsApp Phone ID non configurato per questa attività." }, { status: 400 });
    }

    let result;
    if (templateName) {
      result = await sendTemplateMessage(phoneId, to, templateName, templateParams || []);
    } else {
      result = await sendTextMessage(phoneId, to, body);
    }

    await prisma.whatsappMessage.create({
      data: {
        businessId: auth.business.id,
        direction: "outbound",
        phone: to,
        body: body || `[Template: ${templateName}]`,
        status: result.messages?.[0]?.id ? "sent" : "failed",
        templateId: templateName || null,
      },
    });

    return Response.json({ success: true, messageId: result.messages?.[0]?.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore invio messaggio";
    return Response.json({ error: message }, { status: 500 });
  }
}
