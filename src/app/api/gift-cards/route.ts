import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { GIFT_CARD_AMOUNTS } from "@/lib/marketplace";
import { createGiftCard, redeemGiftCard } from "@/lib/payments";
import { checkRateLimit, validateInput } from "@/lib/security";

export const dynamic = "force-dynamic";

const ALLOWED_PUBLIC_AMOUNTS = new Set(GIFT_CARD_AMOUNTS);

function normalizeAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return null;
  }
  return Math.round(amount * 100) / 100;
}

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const payload = await request.json();
    const action = typeof payload.action === "string" ? payload.action : "marketplace_purchase";

    if (action === "redeem") {
      const business = await requireBusinessContext();
      if (!business) {
        return apiError("Autenticazione richiesta", 401, "unauthorized");
      }

      const amountEuro = normalizeAmount(payload.amountEuro);
      if (!payload.code || amountEuro === null || amountEuro <= 0) {
        return apiError("Codice e importo sono obbligatori", 400, "invalid_redeem_request");
      }

      const result = await redeemGiftCard(String(payload.code).trim().toUpperCase(), amountEuro, business.id);
      if ("error" in result) {
        return apiError(result.error, 400, "gift_card_redeem_failed");
      }
      return apiJson(result);
    }

    const amountEuro = normalizeAmount(payload.amountEuro);
    if (amountEuro === null) {
      return apiError("Importo non valido", 400, "invalid_amount");
    }

    if (action === "business_issue") {
      const business = await requireBusinessContext();
      if (!business) {
        return apiError("Autenticazione richiesta", 401, "unauthorized");
      }
      if (amountEuro <= 0) {
        return apiError("Importo non valido", 400, "invalid_amount");
      }

      const giftCard = await createGiftCard({
        businessId: business.id,
        amountEuro,
        purchaserName: payload.purchaserName,
        purchaserPhone: payload.purchaserPhone,
        recipientName: payload.recipientName,
        recipientPhone: payload.recipientPhone,
        message: payload.message,
      });

      return apiJson(giftCard, { status: 201 });
    }

    const validationErrors = validateInput(payload, [
      { field: "purchaserName", type: "string", required: true, minLength: 2, maxLength: 80 },
      { field: "recipientName", type: "string", required: true, minLength: 2, maxLength: 80 },
      { field: "purchaserPhone", type: "phone" },
      { field: "recipientPhone", type: "phone" },
      { field: "message", type: "string", maxLength: 300 },
    ]);

    if (validationErrors.length > 0) {
      return apiError(validationErrors[0].message, 400, "invalid_gift_card_payload");
    }

    if (!ALLOWED_PUBLIC_AMOUNTS.has(amountEuro)) {
      return apiError("Importo non supportato per il marketplace", 400, "unsupported_amount");
    }

    const rateLimitKey =
      (typeof payload.purchaserPhone === "string" && payload.purchaserPhone.trim()) ||
      request.headers.get("x-forwarded-for") ||
      "anonymous";
    const rateLimit = await checkRateLimit("gift_card", rateLimitKey);
    if (!rateLimit.allowed) {
      return apiError("Troppi tentativi. Riprova più tardi.", 429, "gift_card_rate_limited");
    }

    const giftCard = await createGiftCard({
      amountEuro,
      purchaserName: payload.purchaserName,
      purchaserPhone: payload.purchaserPhone,
      recipientName: payload.recipientName,
      recipientPhone: payload.recipientPhone,
      message: payload.message,
    });

    return apiJson(giftCard, { status: 201 });
  } catch {
    return apiError("Errore nella gestione del buono regalo.", 400, "gift_card_failed");
  }
}
