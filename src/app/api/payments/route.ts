import { requireBusinessContext } from "@/lib/auth";
import { createDepositPayment, getPaymentStats } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await requireBusinessContext();
  if (!business) {
    return Response.json({ error: "Autenticazione richiesta" }, { status: 401 });
  }

  const stats = await getPaymentStats(business.id);
  return Response.json(stats);
}

export async function POST(request: Request) {
  try {
    const business = await requireBusinessContext();
    if (!business) {
      return Response.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const payload = await request.json();

    if (payload.type === "deposit") {
      if (!payload.bookingId) {
        return Response.json({ error: "bookingId obbligatorio" }, { status: 400 });
      }

      const clientSecret = await createDepositPayment({
        businessId: business.id,
        bookingId: payload.bookingId,
      });
      return Response.json({ clientSecret });
    }

    return Response.json({ error: "Tipo di pagamento non supportato" }, { status: 400 });
  } catch {
    return Response.json(
      { error: "Errore nella creazione del pagamento." },
      { status: 400 }
    );
  }
}
