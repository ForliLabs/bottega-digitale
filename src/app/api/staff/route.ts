import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await getBusinessContext();
  if (!business) {
    return Response.json({ staff: [] });
  }

  const staff = await prisma.staffProfile.findMany({
    where: { businessId: business.id },
    include: {
      bookings: {
        where: { status: { in: ["Confermata", "Completata"] } },
        orderBy: { startsAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Compute stats for each staff member
  const staffWithStats = await Promise.all(
    staff.map(async (member) => {
      const [totalBookings, completedBookings, revenue] = await Promise.all([
        prisma.booking.count({ where: { staffId: member.id } }),
        prisma.booking.count({ where: { staffId: member.id, status: "Completata" } }),
        prisma.booking.aggregate({
          where: { staffId: member.id, status: "Completata" },
          _sum: { priceEuro: true },
        }),
      ]);

      return {
        ...member,
        stats: {
          totalBookings,
          completedBookings,
          revenue: revenue._sum.priceEuro || 0,
        },
      };
    })
  );

  return Response.json({ staff: staffWithStats });
}

export async function POST(request: Request) {
  try {
    const business = await getBusinessContext();
    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
    }

    const payload = await request.json();

    const member = await prisma.staffProfile.create({
      data: {
        businessId: business.id,
        name: payload.name || "Nuovo collaboratore",
        email: payload.email || null,
        phone: payload.phone || null,
        role: payload.role || "staff",
        color: payload.color || randomColor(),
        workingHours: JSON.stringify(payload.workingHours || defaultWorkingHours()),
        serviceIds: JSON.stringify(payload.serviceIds || []),
        active: true,
      },
    });

    return Response.json(member, { status: 201 });
  } catch {
    return Response.json({ error: "Errore nella creazione del collaboratore" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const business = await getBusinessContext();
    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
    }

    const payload = await request.json();
    const { id, ...updates } = payload;

    if (updates.workingHours && typeof updates.workingHours !== "string") {
      updates.workingHours = JSON.stringify(updates.workingHours);
    }
    if (updates.serviceIds && typeof updates.serviceIds !== "string") {
      updates.serviceIds = JSON.stringify(updates.serviceIds);
    }

    const member = await prisma.staffProfile.update({
      where: { id },
      data: updates,
    });

    return Response.json(member);
  } catch {
    return Response.json({ error: "Errore nell'aggiornamento del collaboratore" }, { status: 400 });
  }
}

function randomColor(): string {
  const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function defaultWorkingHours() {
  return [
    { day: 1, open: "08:30", close: "19:30" }, // Mon
    { day: 2, open: "08:30", close: "19:30" },
    { day: 3, open: "08:30", close: "19:30" },
    { day: 4, open: "08:30", close: "19:30" },
    { day: 5, open: "08:30", close: "19:30" },
    { day: 6, open: "08:00", close: "18:00" }, // Sat
  ];
}
