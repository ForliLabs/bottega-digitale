import { prisma } from "@/lib/prisma";

// WhatsApp Cloud API webhook verification + message receipt
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return Response.json({ error: "Verifica fallita." }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (!messages?.length) {
      return Response.json({ received: true });
    }

    for (const msg of messages) {
      const phone = msg.from;
      const text = msg.text?.body || msg.type;

      // Find business by WhatsApp phone ID
      const phoneId = changes.value?.metadata?.phone_number_id;
      const business = await prisma.business.findFirst({
        where: { whatsappPhoneId: phoneId },
      });

      if (business) {
        await prisma.whatsappMessage.create({
          data: {
            businessId: business.id,
            direction: "inbound",
            phone,
            body: text,
            status: "delivered",
          },
        });
      }
    }

    return Response.json({ received: true });
  } catch {
    return Response.json({ error: "Errore webhook." }, { status: 500 });
  }
}
