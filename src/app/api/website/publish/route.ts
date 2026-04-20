import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return Response.json({ error: "Non autenticato." }, { status: 401 });
  }

  try {
    const { publish } = await request.json();

    await prisma.business.update({
      where: { id: auth.business.id },
      data: { websitePublished: publish !== false },
    });

    const subdomain = `${auth.business.slug}.bottegadigitale.it`;

    return Response.json({
      published: publish !== false,
      url: `https://${subdomain}`,
      slug: auth.business.slug,
    });
  } catch {
    return Response.json({ error: "Errore pubblicazione sito." }, { status: 500 });
  }
}
