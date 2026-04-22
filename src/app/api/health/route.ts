import { prisma } from "@/lib/prisma";
import { validateEnvironment } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  // Check database connectivity
  let dbOk = false;
  let dbError: string | null = null;
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    dbOk = true;
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Errore database sconosciuto";
  }

  // Check environment
  const env = validateEnvironment();

  // Check integrations
  const integrations = {
    stripe: !!process.env.STRIPE_SECRET_KEY,
    whatsapp: !!process.env.WHATSAPP_TOKEN,
    openai: !!process.env.OPENAI_API_KEY,
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    pushNotifications: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
  };

  const responseTime = Date.now() - startTime;
  const healthy = dbOk && env.valid;

  return Response.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      responseTimeMs: responseTime,
      version: process.env.npm_package_version || "0.1.0",
      checks: {
        database: { ok: dbOk, error: dbError },
        environment: { ok: env.valid, missing: env.missing, warnings: env.warnings },
        integrations,
      },
    },
    { status: healthy ? 200 : 503 }
  );
}
