import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const auth = await getAuthContext();
  if (!auth) {
    return apiError("Non autenticato.", 401, "unauthorized");
  }

  try {
    const payload = await request.json();
    const publish = payload.publish !== false;

    await prisma.business.update({
      where: { id: auth.business.id },
      data: {
        websitePublished: publish,
        websiteTemplate: typeof payload.websiteTemplate === "string" && payload.websiteTemplate.trim()
          ? payload.websiteTemplate.trim()
          : auth.business.websiteTemplate,
        description: typeof payload.description === "string" && payload.description.trim()
          ? payload.description.trim()
          : auth.business.description,
        phone: typeof payload.phone === "string" && payload.phone.trim()
          ? payload.phone.trim()
          : auth.business.phone,
        email: typeof payload.email === "string" && payload.email.trim()
          ? payload.email.trim()
          : auth.business.email,
        address: typeof payload.address === "string" && payload.address.trim()
          ? payload.address.trim()
          : auth.business.address,
      },
    });

    const subdomain = `${auth.business.slug}.bottegadigitale.it`;

    return apiJson({
      published: publish,
      url: `https://${subdomain}`,
      slug: auth.business.slug,
    });
  } catch {
    return apiError("Errore pubblicazione sito.", 500, "website_publish_failed");
  }
}
