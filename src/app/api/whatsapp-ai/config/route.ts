import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  const payload = await request.json();
  const personality = payload.personality === "formale" ? "formale" : "amichevole";
  const faqLines = Array.isArray(payload.faqLines) ? payload.faqLines : [];
  const normalizedFaqLines: string[] = faqLines
    .map((line: unknown) => typeof line === "string" ? line.trim() : "")
    .filter((line: string) => Boolean(line));
  const faqs = normalizedFaqLines.map((line) => {
      const [q, ...rest] = line.split("|");
      return { q: q?.trim() || line, a: rest.join("|").trim() || "Risposta da completare" };
    });

  await prisma.business.update({
    where: { id: business.id },
    data: {
      whatsappAiEnabled: payload.enabled !== false,
      whatsappAiPersonality: personality,
      whatsappAiFaqs: JSON.stringify(faqs),
    },
  });

  return apiJson({ success: true });
}
