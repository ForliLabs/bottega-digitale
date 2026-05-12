import { processAllPendingJobs, scheduleBookingReminders, getJobStats } from "@/lib/job-scheduler";

export const dynamic = "force-dynamic";

// GET: Job stats for dashboard
export async function GET() {
  const stats = await getJobStats();
  return Response.json(stats);
}

// POST: Trigger job processing (called by cron or manually)
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const action = payload.action || "process";

    // Auth via secret header — deny by default when CRON_SECRET is unset
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;
    if (!expectedSecret || cronSecret !== expectedSecret) {
      return Response.json({ error: "Non autorizzato" }, { status: 401 });
    }

    if (action === "process") {
      const result = await processAllPendingJobs();
      return Response.json(result);
    }

    if (action === "schedule-reminders") {
      const scheduled = await scheduleBookingReminders();
      return Response.json({ scheduled });
    }

    return Response.json({ error: "Azione non supportata" }, { status: 400 });
  } catch {
    return Response.json({ error: "Errore nell'esecuzione dei job" }, { status: 500 });
  }
}
