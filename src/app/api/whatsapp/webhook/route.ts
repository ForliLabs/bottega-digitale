import { prisma } from "@/lib/prisma";

const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET;

async function verifyWhatsAppSignature(request: Request, rawBody: string): Promise<boolean> {
  if (!WHATSAPP_APP_SECRET) {
    // If no secret configured, skip verification (dev mode)
    return true;
  }

  const signature = request.headers.get("x-hub-signature-256");
  if (!signature || !signature.startsWith("sha256=")) {
    return false;
  }

  const expectedHash = signature.slice("sha256=".length);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(WHATSAPP_APP_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const computedHash = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expectedHash.length !== computedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedHash.length; i++) {
    mismatch |= expectedHash.charCodeAt(i) ^ computedHash.charCodeAt(i);
  }
  return mismatch === 0;
}

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
    const rawBody = await request.text();

    const isValid = await verifyWhatsAppSignature(request, rawBody);
    if (!isValid) {
      return Response.json({ error: "Firma non valida." }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
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
