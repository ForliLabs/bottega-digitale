import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { applyTemplate, BUSINESS_TEMPLATES, getTemplate } from "@/lib/business-templates";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  return apiJson({
    templates: BUSINESS_TEMPLATES.map((template) => ({
      id: template.id,
      label: template.label,
      icon: template.icon,
      description: template.description,
      serviceCount: template.services.length,
      productCount: template.products.length,
      websiteTemplate: template.websiteTemplate,
    })),
  });
}

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  try {
    const payload = await request.json();
    const templateId = typeof payload.templateId === "string" ? payload.templateId : "";
    const template = getTemplate(templateId);
    if (!template) {
      return apiError("Template non trovato", 404, "template_not_found");
    }

    const result = await applyTemplate(business.id, template.id);
    if ("error" in result) {
      return apiError(result.error ?? "Template application failed", 400, "template_apply_failed");
    }

    return apiJson({ template: template.label, ...result });
  } catch {
    return apiError("Errore nell'applicazione del template", 500, "template_apply_failed");
  }
}
