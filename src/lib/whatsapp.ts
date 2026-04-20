// WhatsApp Business API Service
// Configure with WHATSAPP_TOKEN and WHATSAPP_PHONE_ID env vars

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

export interface WhatsAppMessagePayload {
  to: string;
  type: "text" | "template";
  body?: string;
  templateName?: string;
  templateParams?: string[];
}

async function whatsappRequest(phoneId: string, endpoint: string, body: Record<string, unknown>) {
  if (!WHATSAPP_TOKEN) {
    throw new Error("WHATSAPP_TOKEN non configurato");
  }
  const res = await fetch(`${WHATSAPP_API_URL}/${phoneId}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function sendTextMessage(phoneId: string, to: string, body: string) {
  return whatsappRequest(phoneId, "/messages", {
    messaging_product: "whatsapp",
    to: to.replace(/\s+/g, "").replace("+", ""),
    type: "text",
    text: { body },
  });
}

export async function sendTemplateMessage(
  phoneId: string,
  to: string,
  templateName: string,
  params: string[]
) {
  return whatsappRequest(phoneId, "/messages", {
    messaging_product: "whatsapp",
    to: to.replace(/\s+/g, "").replace("+", ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: "it" },
      components: [
        {
          type: "body",
          parameters: params.map((text) => ({ type: "text", text })),
        },
      ],
    },
  });
}

// Pre-built message templates for Italian businesses
export const MESSAGE_TEMPLATES = {
  bookingConfirmation: (businessName: string, date: string, service: string) =>
    `✅ Prenotazione confermata!\n\n📍 ${businessName}\n📅 ${date}\n💇 ${service}\n\nTi aspettiamo!`,

  bookingReminder: (businessName: string, date: string) =>
    `⏰ Promemoria: hai un appuntamento domani alle ${date} da ${businessName}.\n\nSe non puoi venire, rispondi a questo messaggio.`,

  reviewRequest: (businessName: string, googleUrl?: string) =>
    `Ciao! Grazie per essere venuto da ${businessName} 😊\n\nTi è piaciuto il servizio? Lasciaci una recensione su Google, ci aiuterebbe tantissimo!\n\n${googleUrl || "⭐ Link alla recensione in arrivo"}`,

  queueNotification: (businessName: string, position: number) =>
    `🔔 Il tuo turno si avvicina!\n\n📍 ${businessName}\n👤 Posizione: ${position}\n\nPresentati al banco tra pochi minuti.`,

  loyaltyUpdate: (businessName: string, points: number, threshold: number) =>
    `🎉 Hai guadagnato punti fedeltà da ${businessName}!\n\n⭐ Punti attuali: ${points}/${threshold}\n\n${points >= threshold ? "🎁 Hai raggiunto il premio! Riscattalo alla prossima visita." : `Ancora ${threshold - points} punti per il premio!`}`,
};

export function isWhatsAppConfigured(): boolean {
  return !!WHATSAPP_TOKEN;
}
