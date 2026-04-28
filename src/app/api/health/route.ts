import { prisma } from "@/lib/prisma";
import { validateEnvironment } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const verbose = searchParams.get("verbose") === "true";

  // Check database connectivity
  let dbOk = false;
  let dbError: string | null = null;
  let dbLatencyMs = 0;
  try {
    const dbStart = Date.now();
    await prisma.$queryRawUnsafe("SELECT 1");
    dbLatencyMs = Date.now() - dbStart;
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
    email: !!process.env.RESEND_API_KEY,
    mediaStorage: !!process.env.MEDIA_STORAGE_ENDPOINT,
  };

  // Memory usage
  const memoryUsage = process.memoryUsage();

  const responseTime = Date.now() - startTime;
  const healthy = dbOk && env.valid;

  const response: Record<string, unknown> = {
    status: healthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    responseTimeMs: responseTime,
    version: process.env.npm_package_version || "0.1.0",
    environment: process.env.NODE_ENV || "development",
    checks: {
      database: { ok: dbOk, latencyMs: dbLatencyMs, error: dbError },
      environment: { ok: env.valid, missing: env.missing },
      integrations,
    },
  };

  if (verbose) {
    response.memory = {
      heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
    };
    response.uptime = Math.round(process.uptime());
    response.warnings = env.warnings;
  }

  return Response.json(response, { status: healthy ? 200 : 503 });
}
