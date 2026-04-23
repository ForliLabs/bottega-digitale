import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, validateInput } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Input validation
    const errors = validateInput({ email, password }, [
      { field: "email", type: "email", required: true },
      { field: "password", type: "string", required: true, minLength: 6, maxLength: 128 },
    ]);
    if (errors.length > 0) {
      return Response.json({ error: errors[0].message }, { status: 400 });
    }

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateCheck = await checkRateLimit("login", ip);
    if (!rateCheck.allowed) {
      return Response.json(
        { error: "Troppi tentativi di accesso. Riprova tra qualche minuto." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateCheck.resetAt.getTime() - Date.now()) / 1000)) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: "Credenziali non valide." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return Response.json({ error: "Credenziali non valide." }, { status: 401 });
    }

    const token = await createSession(user.id);
    await setSessionCookie(token);

    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      include: { business: true },
    });

    return Response.json({
      user: { id: user.id, email: user.email, name: user.name },
      business: membership?.business || null,
    });
  } catch {
    return Response.json({ error: "Errore durante il login." }, { status: 500 });
  }
}
