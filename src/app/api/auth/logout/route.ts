import { prisma } from "@/lib/prisma";
import { getSessionToken, clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    await clearSessionCookie();
  }
  return Response.json({ success: true });
}
