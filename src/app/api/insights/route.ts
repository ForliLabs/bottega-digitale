import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { generateInsights, saveInsights, getLatestInsights } from "@/lib/ai-advisor";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await getBusinessContext();
  if (!business) {
    return Response.json({ insights: [] });
  }

  const insights = await getLatestInsights(business.id);
  return Response.json({ insights });
}

export async function POST(request: Request) {
  try {
    const business = await getBusinessContext();
    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
    }

    const payload = await request.json();
    const action = payload.action || "generate";

    if (action === "generate") {
      const insights = await generateInsights(business.id);
      await saveInsights(business.id, insights);
      return Response.json({ insights, message: `${insights.length} nuovi insight generati` });
    }

    if (action === "dismiss") {
      await prisma.insight.update({
        where: { id: payload.insightId },
        data: { dismissed: true },
      });
      return Response.json({ success: true });
    }

    return Response.json({ error: "Azione non supportata" }, { status: 400 });
  } catch {
    return Response.json({ error: "Errore nella generazione degli insight" }, { status: 500 });
  }
}
