import { getBusinessContext } from "@/lib/auth";
import { createDepositPayment, getPaymentStats } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await getBusinessContext();
  if (!business) {
    return Response.json({ error: "Attività non trovata" }, { status: 404 });
  }

  const stats = await getPaymentStats(business.id);
  return Response.json(stats);
}

export async function POST(request: Request) {
  try {
    const business = await getBusinessContext();
    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
    }

    const payload = await request.json();

    if (payload.type === "deposit") {
      const clientSecret = await createDepositPayment({
        businessId: business.id,
        bookingId: payload.bookingId,
        amountEuro: payload.amountEuro,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
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
