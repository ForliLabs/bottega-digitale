import { requestCustomerOTP, verifyCustomerOTP, getCustomerFromToken } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { validateInput } from "@/lib/security";
import { isValidPhoneNumber, normalizePhoneNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET: Validate session token and return customer data
export async function GET(request: Request) {
  const token = request.headers.get("x-customer-token");
  if (!token) {
    return Response.json({ error: "Token mancante" }, { status: 401 });
  }

  const customer = await getCustomerFromToken(token);
  if (!customer) {
    return Response.json({ error: "Sessione non valida" }, { status: 401 });
  }

  // Fetch customer's data
  const [bookings, loyaltyCards] = await Promise.all([
    prisma.booking.findMany({
      where: { customerId: customer.id },
      orderBy: { startsAt: "desc" },
      take: 10,
    }),
    prisma.loyaltyCard.findMany({
      where: { customerId: customer.id },
      include: { business: { select: { name: true, loyaltyRewardThreshold: true, loyaltyRewardName: true } } },
    }),
  ]);

  return Response.json({
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      totalVisits: customer.totalVisits,
      notifyWhatsApp: customer.notifyWhatsApp,
      notifyPush: customer.notifyPush,
    },
    bookings,
    loyaltyCards,
  });
}

// POST: Request OTP or verify OTP
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const action = payload.action;

    if (action === "request-otp") {
      const { businessId, slug, phone } = payload;

      let resolvedBusinessId = businessId;
      if (!resolvedBusinessId && slug) {
        const business = await prisma.business.findUnique({ where: { slug } });
        if (business) resolvedBusinessId = business.id;
      }

      const normalizedPhone = normalizePhoneNumber(String(phone || ""));
      const errors = validateInput(
        { phone: normalizedPhone },
        [{ field: "phone", type: "phone", required: true }],
      );

      if (!resolvedBusinessId || errors.length > 0 || !isValidPhoneNumber(normalizedPhone)) {
        return Response.json({ error: "Inserisci un numero WhatsApp valido" }, { status: 400 });
      }

      const result = await requestCustomerOTP(resolvedBusinessId, normalizedPhone);
      return Response.json(result);
    }

    if (action === "verify-otp") {
      const { sessionId, otpCode } = payload;
      if (!sessionId || !otpCode) {
        return Response.json({ error: "sessionId e otpCode obbligatori" }, { status: 400 });
      }

      const result = await verifyCustomerOTP(sessionId, otpCode);
      if (!result) {
        return Response.json({ error: "Codice non valido o scaduto" }, { status: 401 });
      }

      return Response.json({ token: result.token, customerId: result.customerId });
    }

    return Response.json({ error: "Azione non supportata" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore di autenticazione";
    const status = message.startsWith("Troppi tentativi") ? 429 : 500;
    return Response.json({ error: message }, { status });
  }
}
