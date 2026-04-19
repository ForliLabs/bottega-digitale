import { prisma } from "@/lib/prisma";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    const { email, password, name, businessName, businessCategory, address, phone } =
      await request.json();

    if (!email || !password || !businessName) {
      return Response.json(
        { error: "Email, password e nome attività sono obbligatori." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "Questa email è già registrata." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, name: name || null, passwordHash, role: "owner" },
    });

    let slug = slugify(businessName);
    const slugExists = await prisma.business.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const business = await prisma.business.create({
      data: {
        name: businessName,
        slug,
        category: businessCategory || "Attività generica",
        address: address || "",
        phone: phone || "",
        email,
        description: `${businessName} — la tua bottega digitale.`,
        openingHours: JSON.stringify([
          "Lunedì–Venerdì 09:00–18:00",
          "Sabato 09:00–13:00",
          "Domenica chiuso",
        ]),
      },
    });

    await prisma.membership.create({
      data: { userId: user.id, businessId: business.id, role: "owner" },
    });

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return Response.json(
      {
        user: { id: user.id, email: user.email, name: user.name },
        business: { id: business.id, name: business.name, slug: business.slug },
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: "Errore durante la registrazione." }, { status: 500 });
  }
}
