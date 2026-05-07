export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { getConversationStats } from "@/lib/whatsapp-ai";
import { WhatsAppAIClient } from "./whatsapp-ai-client";

export default async function WhatsAppAIPage() {
  const business = await getBusinessContext();
  const stats = business ? await getConversationStats(business.id) : null;
  const faqs = business ? JSON.parse(business.whatsappAiFaqs || "[]") as Array<{ q: string; a: string }> : [];

  return (
    <WhatsAppAIClient
      initialSettings={{
        enabled: business?.whatsappAiEnabled || false,
        personality: business?.whatsappAiPersonality || "amichevole",
        faqLines: faqs.map((item) => `${item.q}|${item.a}`),
        capabilities: [
          {
            label: "Prenotazioni automatiche",
            active: Boolean(business?.onlineBookingEnabled),
            description: "Conferma slot disponibili e guida il cliente nel flusso di prenotazione.",
          },
          {
            label: "Saldo punti fedeltà",
            active: Boolean(business?.loyaltyEnabled),
            description: "Risponde al volo su saldo punti, premi disponibili e prossima soglia.",
          },
          {
            label: "Stato coda",
            active: Boolean(business?.queueEnabled),
            description: "Comunica posizione, attesa stimata e stato del turno direttamente in chat.",
          },
          {
            label: "FAQ personalizzate",
            active: true,
            description: "Usa le domande frequenti salvate qui accanto per dare risposte coerenti.",
          },
        ],
      }}
      stats={stats}
    />
  );
}
