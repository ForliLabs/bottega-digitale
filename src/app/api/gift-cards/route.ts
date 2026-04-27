import { createGiftCard, redeemGiftCard } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (payload.action === "redeem") {
      const result = await redeemGiftCard(payload.code, payload.amountEuro, payload.businessId);
      if ("error" in result) {
        return Response.json({ error: result.error }, { status: 400 });
      }
      return Response.json(result);
    }

    // Create gift card
    const giftCard = await createGiftCard({
      businessId: payload.businessId,
      amountEuro: payload.amountEuro || 25,
      purchaserName: payload.purchaserName,
      purchaserPhone: payload.purchaserPhone,
      recipientName: payload.recipientName,
      recipientPhone: payload.recipientPhone,
      message: payload.message,
    });

    return Response.json(giftCard, { status: 201 });
  } catch {
    return Response.json(
      { error: "Errore nella gestione del buono regalo." },
      { status: 400 }
    );
  }
}
