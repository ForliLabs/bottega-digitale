import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { generateInsights, saveInsights, getLatestInsights } from "@/lib/ai-advisor";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  const insights = await getLatestInsights(business.id);
  return apiJson({ insights });
}

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const business = await requireBusinessContext();
    if (!business) {
      return apiError("Autenticazione richiesta", 401, "unauthorized");
    }

    const payload = await request.json();
    const action = payload.action || "generate";

    if (action === "generate") {
      const insights = await generateInsights(business.id);
      await saveInsights(business.id, insights);
      return apiJson({ insights, message: `${insights.length} nuovi insight generati` });
    }

    if (action === "dismiss") {
      const result = await prisma.insight.updateMany({
        where: { id: payload.insightId, businessId: business.id },
        data: { dismissed: true },
      });
      if (result.count === 0) {
        return apiError("Insight non trovato", 404, "insight_not_found");
      }
      return apiJson({ success: true });
    }

    return apiError("Azione non supportata", 400, "invalid_action");
  } catch {
    return apiError("Errore nella generazione degli insight", 500, "insights_failed");
  }
}
