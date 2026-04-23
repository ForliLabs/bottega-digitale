import { prisma } from "@/lib/prisma";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, validateInput } from "@/lib/security";
import { seedDefaultFlows } from "@/lib/event-bus";

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

    // Input validation
    const errors = validateInput(
      { email, password, businessName },
      [
        { field: "email", type: "email", required: true },
        { field: "password", type: "string", required: true, minLength: 8, maxLength: 128 },
        { field: "businessName", type: "string", required: true, minLength: 2, maxLength: 100 },
      ]
    );
    if (errors.length > 0) {
      return Response.json({ error: errors[0].message }, { status: 400 });
    }

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateCheck = await checkRateLimit("register", ip);
    if (!rateCheck.allowed) {
      return Response.json(
        { error: "Troppi tentativi di registrazione. Riprova più tardi." },
        { status: 429 }
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

    // Seed default automation flows for new business
    await seedDefaultFlows(business.id);

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
