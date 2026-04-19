import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email e password sono obbligatori." }, { status: 400 });
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
