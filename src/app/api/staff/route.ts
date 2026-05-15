import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
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

  const staffIds = staff.map((member) => member.id);
  const [bookingCounts, completedCounts, revenueByStaff] = await Promise.all([
    prisma.booking.groupBy({
      by: ["staffId"],
      where: { staffId: { in: staffIds } },
      _count: { _all: true },
    }),
    prisma.booking.groupBy({
      by: ["staffId"],
      where: { staffId: { in: staffIds }, status: "Completata" },
      _count: { _all: true },
    }),
    prisma.booking.groupBy({
      by: ["staffId"],
      where: { staffId: { in: staffIds }, status: "Completata" },
      _sum: { priceEuro: true },
    }),
  ]);

  const totalBookingsMap = new Map(bookingCounts.map((item) => [item.staffId, item._count._all]));
  const completedBookingsMap = new Map(completedCounts.map((item) => [item.staffId, item._count._all]));
  const revenueMap = new Map(revenueByStaff.map((item) => [item.staffId, item._sum.priceEuro || 0]));

  const staffWithStats = staff.map((member) => ({
    ...member,
    stats: {
      totalBookings: totalBookingsMap.get(member.id) || 0,
      completedBookings: completedBookingsMap.get(member.id) || 0,
      revenue: revenueMap.get(member.id) || 0,
    },
  }));

  return apiJson({ staff: staffWithStats });
}

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const business = await requireBusinessContext();
    if (!business) {
      return apiError("Autenticazione richiesta", 401, "unauthorized");
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

    return apiJson(member, { status: 201 });
  } catch {
    return apiError("Errore nella creazione del collaboratore", 500, "staff_create_failed");
  }
}

// Fields that can be updated via the PATCH endpoint
const STAFF_UPDATABLE_FIELDS = new Set([
  "name",
  "email",
  "phone",
  "role",
  "color",
  "workingHours",
  "serviceIds",
  "active",
]);

export async function PATCH(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const business = await requireBusinessContext();
    if (!business) {
      return apiError("Autenticazione richiesta", 401, "unauthorized");
    }

    const payload = await request.json();
    const { id, ...rawUpdates } = payload;

    if (!id || typeof id !== "string") {
      return apiError("ID collaboratore richiesto", 400, "missing_id");
    }

    // Only allow known fields through
    const updates: Record<string, unknown> = {};
    for (const key of Object.keys(rawUpdates)) {
      if (STAFF_UPDATABLE_FIELDS.has(key)) {
        updates[key] = rawUpdates[key];
      }
    }

    if (updates.workingHours && typeof updates.workingHours !== "string") {
      updates.workingHours = JSON.stringify(updates.workingHours);
    }
    if (updates.serviceIds && typeof updates.serviceIds !== "string") {
      updates.serviceIds = JSON.stringify(updates.serviceIds);
    }

    // Validate role if provided
    if (updates.role !== undefined) {
      const validRoles = ["owner", "manager", "staff"];
      if (!validRoles.includes(updates.role as string)) {
        return apiError("Ruolo non valido", 400, "invalid_role");
      }
    }

    const updated = await prisma.staffProfile.updateMany({
      where: { id, businessId: business.id },
      data: updates,
    });

    if (updated.count === 0) {
      return apiError("Collaboratore non trovato", 404, "staff_not_found");
    }

    const member = await prisma.staffProfile.findFirst({
      where: { id, businessId: business.id },
    });

    return apiJson(member);
  } catch {
    return apiError("Errore nell'aggiornamento del collaboratore", 500, "staff_update_failed");
  }
}

function randomColor(): string {
  const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];
  return colors[randomInt(colors.length)];
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
