import { readFileSync } from "node:fs";
import path from "node:path";

import { PrismaLibSql } from "@prisma/adapter-libsql";

import { PrismaClient } from "../src/generated/prisma/client";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaLibSql(tursoUrl ? { url: tursoUrl, authToken: tursoToken } : { url: databaseUrl });
const prisma = new PrismaClient({ adapter });
const now = new Date();
const DAY_MS = 24 * 60 * 60 * 1000;

const daysAgo = (days: number, hour = 10, minute = 0) => {
  const value = new Date(now.getTime() - days * DAY_MS);
  value.setHours(hour, minute, 0, 0);
  return value;
};

const daysFromNow = (days: number, hour = 10, minute = 0) => {
  const value = new Date(now.getTime() + days * DAY_MS);
  value.setHours(hour, minute, 0, 0);
  return value;
};

const todayAt = (hour: number, minute = 0) => {
  const value = new Date(now);
  value.setHours(hour, minute, 0, 0);
  return value;
};

const round = (value: number, decimals = 2) => Math.round(value * 10 ** decimals) / 10 ** decimals;
const pick = <T,>(values: readonly T[], index: number) => values[index % values.length]!;
const commonWorkingHours = JSON.stringify([
  { day: "Mon", from: "09:00", to: "13:00", from2: "15:00", to2: "19:00" },
  { day: "Tue", from: "09:00", to: "13:00", from2: "15:00", to2: "19:00" },
  { day: "Wed", from: "09:00", to: "13:00", from2: "15:00", to2: "19:00" },
  { day: "Thu", from: "09:00", to: "13:00", from2: "15:00", to2: "19:00" },
  { day: "Fri", from: "09:00", to: "13:00", from2: "15:00", to2: "19:00" },
  { day: "Sat", from: "09:00", to: "13:00" },
]);

const firstNames = ["Marco", "Giulia", "Luca", "Sofia", "Alessandro", "Chiara", "Andrea", "Valentina", "Matteo", "Francesca", "Davide", "Elena", "Simone", "Laura", "Federico", "Martina", "Giovanni", "Sara", "Pietro", "Anna", "Roberto", "Claudia", "Stefano", "Maria", "Fabio", "Paola", "Nicola", "Silvia", "Antonio", "Elisa", "Gabriele", "Irene", "Tommaso", "Linda", "Samuele", "Veronica"] as const;
const lastNames = ["Rossi", "Bianchi", "Ferrari", "Romano", "Ricci", "Marino", "Greco", "Bruni", "Conti", "Mancini", "Santoro", "Rinaldi", "Moretti", "Leone", "Ferrara", "Vitale", "Casadei", "Fabbri", "Mazzotti", "Pasini", "Monti", "Donati", "Ravaglia", "Guidi", "Nanni", "Randi", "Savini", "Gori", "Gualtieri", "Melandri"] as const;
const channels = ["Sito web", "WhatsApp", "Instagram", "Telefono", "Online"] as const;

function customerName(index: number) {
  return `${firstNames[index % firstNames.length]} ${lastNames[(index * 3) % lastNames.length]}`;
}

function customerPhone(index: number) {
  return `+3934${String(2000000 + index * 137).padStart(7, "0")}`;
}

interface SeedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}
interface SeedService { id: string; name: string; priceEuro: number; durationMinutes: number; }
interface SeedStaff { id: string; userId?: string; name: string; role: string; color: string; }
interface SeedReview { author: string; rating: number; comment: string; }
interface SeedCategory { id: string; name: string; }
interface SeedProduct { id: string; categoryId: string; name: string; description: string; priceEuro: number; stock: number; }
interface SeedBusiness {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  openingHours: string[];
  subscriptionTier: string;
  avgServiceMinutes: number;
  partitaIva: string;
  codiceFiscale: string;
  codiceDestinatario: string;
  regimeFiscale: string;
  vatRate: number;
  bookingCount: number;
  customerOffset: number;
  catalogEnabled?: boolean;
  services: SeedService[];
  staff: SeedStaff[];
  reviews: SeedReview[];
  socialPosts: string[];
  giftCards: number[];
  automationLabels: string[];
  productCategories?: SeedCategory[];
  products?: SeedProduct[];
  orderCount?: number;
}
interface SeedData { users: SeedUser[]; businesses: SeedBusiness[]; }

const dataPath = path.join(process.cwd(), "prisma/seed-data/demo.json");
const seedData = JSON.parse(readFileSync(dataPath, "utf8")) as SeedData;

async function clearDatabase() {
  await prisma.webhookDelivery.deleteMany();
  await prisma.webhookEndpoint.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.npsResponse.deleteMany();
  await prisma.npsSurvey.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.emailTemplateOverride.deleteMany();
  await prisma.emailDelivery.deleteMany();
  await prisma.dataExportRequest.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.customerConsent.deleteMany();
  await prisma.businessHealthScore.deleteMany();
  await prisma.platformEvent.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.translationOverride.deleteMany();
  await prisma.regionConfig.deleteMany();
  await prisma.accountantClientLink.deleteMany();
  await prisma.accountant.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.giftCard.deleteMany();
  await prisma.groupSubscription.deleteMany();
  await prisma.associationAdmin.deleteMany();
  await prisma.associationMembership.deleteMany();
  await prisma.association.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.conversationState.deleteMany();
  await prisma.rateLimit.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.crossPromotion.deleteMany();
  await prisma.partnership.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.fiscalProfile.deleteMany();
  await prisma.customerSession.deleteMany();
  await prisma.queueEntry.deleteMany();
  await prisma.flowExecution.deleteMany();
  await prisma.automationFlow.deleteMany();
  await prisma.loyaltyRedemption.deleteMany();
  await prisma.loyaltyCard.deleteMany();
  await prisma.socialPost.deleteMany();
  await prisma.whatsappMessage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.job.deleteMany();
  await prisma.insight.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.session.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();
  await prisma.stripeEvent.deleteMany();
}

function buildCustomers(business: SeedBusiness) {
  return Array.from({ length: 56 }, (_, index) => {
    const globalIndex = business.customerOffset + index;
    const visits = 1 + (globalIndex % 14);
    const loyaltyPoints = visits * 9 + (index % 3) * 4;
    return {
      id: `customer-${business.slug}-${index + 1}`,
      businessId: business.id,
      name: customerName(globalIndex),
      phone: customerPhone(globalIndex),
      email: index % 5 === 0 ? `cliente${globalIndex}@email.it` : undefined,
      birthday: index % 6 === 0 ? daysAgo(9000 + globalIndex, 12) : undefined,
      lastVisit: daysAgo((globalIndex % 40) + 1, 12),
      lastLogin: index % 7 === 0 ? daysAgo(index + 2, 20) : undefined,
      totalVisits: visits,
      loyaltyPoints,
      notifyWhatsApp: index % 4 !== 0,
      notifyPush: index % 5 !== 0,
    };
  });
}

function buildBookings(business: SeedBusiness, customers: ReturnType<typeof buildCustomers>) {
  return Array.from({ length: business.bookingCount }, (_, index) => {
    const isFuture = index >= business.bookingCount - 12;
    const customer = customers[index % customers.length]!;
    const service = business.services[(index * 3) % business.services.length]!;
    const staff = business.staff[(index + 1) % business.staff.length]!;
    const slot = isFuture ? daysFromNow((index % 14) + 1, 9 + (index % 7), (index % 4) * 15) : daysAgo((index * 2) % 90 + 1, 9 + (index % 8), (index % 4) * 15);
    return {
      id: `booking-${business.slug}-${index + 1}`,
      businessId: business.id,
      customerId: customer.id,
      serviceId: service.id,
      staffId: staff.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      service: service.name,
      startsAt: slot,
      durationMinutes: service.durationMinutes,
      status: isFuture ? (index % 3 === 0 ? "In attesa" : "Confermata") : index % 13 === 0 ? "Cancellata" : "Completata",
      channel: pick(channels, index),
      priceEuro: service.priceEuro,
      notes: isFuture ? "Cliente confermato via reminder automatico." : index % 9 === 0 ? "Richiesta posto vicino alla vetrina / tavolo finestra." : undefined,
    };
  });
}

function buildQueues(business: SeedBusiness, customers: ReturnType<typeof buildCustomers>) {
  return Array.from({ length: 4 }, (_, index) => ({
    id: `queue-${business.slug}-${index + 1}`,
    businessId: business.id,
    customerId: customers[index]?.id,
    customerName: customers[index]?.name ?? `Walk-in ${index + 1}`,
    customerPhone: customers[index]?.phone,
    position: index + 1,
    status: pick(["waiting", "called", "serving", "completed"], index),
    estimatedWaitMin: 8 + index * 7,
    createdAt: todayAt(9 + index, 10),
    calledAt: index >= 1 ? todayAt(9 + index, 25) : undefined,
    completedAt: index === 3 ? todayAt(11, 15) : undefined,
  }));
}

function buildLoyalty(business: SeedBusiness, customers: ReturnType<typeof buildCustomers>) {
  const cards = customers.slice(0, 24).map((customer, index) => ({
    id: `loyalty-${business.slug}-${index + 1}`,
    businessId: business.id,
    customerId: customer.id,
    points: customer.loyaltyPoints,
    totalEarned: customer.loyaltyPoints + 10 + (index % 4) * 8,
  }));
  const redemptions = cards.slice(0, 5).map((card, index) => ({
    id: `loyalty-redemption-${business.slug}-${index + 1}`,
    businessId: business.id,
    cardId: card.id,
    points: 80,
    reward: index % 2 === 0 ? "Premio fedeltà" : "Buono prossimo acquisto",
    createdAt: daysAgo(18 - index, 18),
  }));
  return { cards, redemptions };
}

function buildInvoices(business: SeedBusiness, fiscalProfileId: string, services: SeedService[], customers: ReturnType<typeof buildCustomers>) {
  const invoices = Array.from({ length: 6 }, (_, index) => {
    const customer = customers[(index * 7) % customers.length]!;
    const service = services[(index * 2) % services.length]!;
    const quantity = service.priceEuro > 0 ? 1 + (index % 2) : 2 + (index % 3);
    const unitPrice = service.priceEuro > 0 ? service.priceEuro : business.category === "Ristorante" ? 22 : 18;
    const totalNet = round(quantity * unitPrice, 2);
    const totalVat = round(totalNet * (business.vatRate / 100), 2);
    return {
      id: `invoice-${business.slug}-${index + 1}`,
      fiscalProfileId,
      progressiveNumber: index + 1,
      fiscalYear: now.getFullYear(),
      customerName: customer.name,
      customerFiscalCode: `CF${String(index + 1).padStart(6, "0")}${business.slug.slice(0, 3).toUpperCase()}`,
      customerAddress: `Via Demo ${index + 4}, ${business.city}`,
      totalNet,
      totalVat,
      totalGross: round(totalNet + totalVat, 2),
      vatRate: business.vatRate,
      status: index < 4 ? "consegnata" : "inviata",
      sdiIdentifier: `${business.slug.slice(0, 3).toUpperCase()}-${now.getFullYear()}-${index + 1}`,
      pdfUrl: `https://demo.bottega.local/invoices/${business.slug}-${index + 1}.pdf`,
      xmlContent: `<Fattura id='${business.slug}-${index + 1}'/>`,
      notes: index % 2 === 0 ? "Incasso registrato su POS del punto vendita." : "Documento inviato automaticamente via SDI.",
      issuedAt: daysAgo(28 - index * 4, 9),
    };
  });

  const lines = invoices.map((invoice, index) => ({
    id: `invoice-line-${business.slug}-${index + 1}`,
    invoiceId: invoice.id,
    description: business.category === "Ristorante" ? `Servizio ${services[(index * 2) % services.length]!.name} + coperti` : services[(index * 2) % services.length]!.name,
    quantity: business.category === "Ristorante" ? 2 + (index % 3) : 1 + (index % 2),
    unitPrice: round(invoice.totalNet / (business.category === "Ristorante" ? 2 + (index % 3) : 1 + (index % 2)), 2),
    vatRate: business.vatRate,
    totalNet: invoice.totalNet,
    totalVat: invoice.totalVat,
  }));

  return { invoices, lines };
}

function buildWhatsApp(business: SeedBusiness, customers: ReturnType<typeof buildCustomers>) {
  const outboundTemplates = [
    "Ciao! Ti ricordiamo il tuo appuntamento di domani.",
    "Grazie per essere passato da noi, ci lasci una recensione?",
    "La tua richiesta è stata confermata. Ti aspettiamo.",
    "Il tuo ordine è pronto per il ritiro in negozio.",
  ] as const;
  const inboundTemplates = [
    "Posso spostare l'appuntamento di mezz'ora?",
    "Avete disponibilità per oggi pomeriggio?",
    "Grazie, tutto perfetto!",
    "Posso aggiungere una persona alla prenotazione?",
  ] as const;
  return Array.from({ length: 10 }, (_, index) => ({
    id: `wa-${business.slug}-${index + 1}`,
    businessId: business.id,
    direction: index % 2 === 0 ? "outbound" : "inbound",
    phone: customers[index]?.phone ?? customerPhone(index),
    body: index % 2 === 0 ? pick(outboundTemplates, index) : pick(inboundTemplates, index),
    status: index % 5 === 0 ? "read" : index % 3 === 0 ? "delivered" : "sent",
    templateId: index % 2 === 0 ? `tpl-${business.slug}-${(index % 3) + 1}` : undefined,
    createdAt: daysAgo(index % 9, 18 - (index % 4), 10),
  }));
}

function buildSocialPosts(business: SeedBusiness) {
  return business.socialPosts.map((caption, index) => ({
    id: `social-${business.slug}-${index + 1}`,
    businessId: business.id,
    imageUrl: `https://demo.bottega.local/${business.slug}/post-${index + 1}.jpg`,
    caption,
    hashtags: business.category === "Barbiere" ? "#forli,#barber,#stileuomo" : business.category === "Ristorante" ? "#cesena,#cucinadiromagna,#trattoria" : "#ravenna,#flowers,#bouquet",
    platform: index % 2 === 0 ? "instagram" : "facebook",
    status: index < 3 ? "published" : "scheduled",
    scheduledAt: index < 3 ? undefined : daysFromNow(index + 1, 10),
    publishedAt: index < 3 ? daysAgo(index + 2, 12) : undefined,
  }));
}

function buildGiftCards(business: SeedBusiness) {
  return business.giftCards.map((amount, index) => ({
    id: `gift-${business.slug}-${index + 1}`,
    businessId: business.id,
    code: `${business.slug.slice(0, 4).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
    amountEuro: amount,
    balanceEuro: index === 1 ? 0 : amount,
    purchaserName: customerName(business.customerOffset + index),
    purchaserPhone: customerPhone(business.customerOffset + index),
    recipientName: customerName(business.customerOffset + index + 20),
    recipientPhone: customerPhone(business.customerOffset + index + 20),
    message: "Un pensiero speciale dal tuo negozio preferito.",
    status: index === 1 ? "redeemed" : "active",
    expiresAt: daysFromNow(180 + index * 20),
    redeemedAt: index === 1 ? daysAgo(12, 16) : undefined,
    createdAt: daysAgo(35 - index * 4, 11),
  }));
}

function buildAutomations(business: SeedBusiness) {
  const flows = business.automationLabels.map((label, index) => ({
    id: `flow-${business.slug}-${index + 1}`,
    businessId: business.id,
    name: label,
    description: `${label} configurato per il demo account di ${business.name}.`,
    enabled: index !== 1 || business.category !== "Barbiere",
    triggerEvent: index === 0 ? "booking.created" : index === 1 ? "booking.completed" : "loyalty.threshold_reached",
    conditions: JSON.stringify({ channel: index === 0 ? "whatsapp" : "dashboard", minVisits: index === 2 ? 6 : 0 }),
    actions: JSON.stringify([{ type: index === 0 ? "send_whatsapp" : index === 1 ? "request_review" : "issue_reward" }]),
  }));
  const executions = flows.flatMap((flow, index) => [0, 1].map((step) => ({
    id: `execution-${flow.id}-${step + 1}`,
    flowId: flow.id,
    triggerData: JSON.stringify({ source: step === 0 ? "system" : "dashboard", customer: customerName(index + step) }),
    status: step === 0 ? "completed" : index % 3 === 0 ? "running" : "completed",
    results: JSON.stringify([{ action: "message", outcome: "sent" }]),
    startedAt: daysAgo(index + step + 1, 8 + step),
    completedAt: step === 0 || index % 3 !== 0 ? daysAgo(index + step + 1, 8 + step, 8) : undefined,
  })));
  return { flows, executions };
}

function buildCatalogOrders(business: SeedBusiness, products: SeedProduct[] | undefined, customers: ReturnType<typeof buildCustomers>) {
  if (!products || products.length === 0) {
    return { categories: [], items: [], orders: [], orderItems: [] };
  }

  const categories = business.productCategories?.map((category, index) => ({ id: category.id, businessId: business.id, name: category.name, sortOrder: index })) ?? [];
  const items = products.map((product, index) => ({ ...product, businessId: business.id, imageUrl: `https://demo.bottega.local/${business.slug}/product-${index + 1}.jpg`, isAvailable: true, sortOrder: index }));
  const orders = Array.from({ length: business.orderCount ?? 0 }, (_, index) => {
    const customer = customers[index % customers.length]!;
    const selected = [items[index % items.length]!, items[(index + 2) % items.length]!].filter((item, itemIndex, array) => array.findIndex((candidate) => candidate.id === item.id) === itemIndex).slice(0, 1 + (index % 2));
    const total = round(selected.reduce((sum, item) => sum + item.priceEuro, 0), 2);
    return {
      id: `order-shop-${business.slug}-${index + 1}`,
      businessId: business.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      status: pick(["ricevuto", "in_preparazione", "pronto", "consegnato"], index),
      channel: index % 3 === 0 ? "whatsapp" : "online",
      totalEuro: total,
      paymentStatus: index % 4 === 0 ? "pending" : "paid",
      notes: index % 5 === 0 ? "Cliente richiede confezione regalo." : undefined,
      createdAt: daysAgo(25 - index, 13),
      updatedAt: daysAgo(25 - index, 14),
      _selected: selected,
    };
  });
  const orderItems = orders.flatMap((order) => order._selected.map((product, index) => ({
    id: `order-item-${order.id}-${index + 1}`,
    orderId: order.id,
    productId: product.id,
    quantity: 1,
    unitPrice: product.priceEuro,
  })));
  return { categories, items, orders: orders.map(({ _selected, ...order }) => order), orderItems };
}

async function seedBusiness(business: SeedBusiness, businessIndex: number) {
  await prisma.business.create({
    data: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      category: business.category,
      city: business.city,
      address: business.address,
      phone: business.phone,
      email: business.email,
      description: business.description,
      openingHours: JSON.stringify(business.openingHours),
      websitePublished: true,
      onlineBookingEnabled: true,
      loyaltyEnabled: true,
      loyaltyPointsPerVisit: 10,
      loyaltyRewardThreshold: 80,
      loyaltyRewardName: business.category === "Barbiere" ? "Servizio gratuito" : business.category === "Ristorante" ? "Dessert omaggio" : "Mini bouquet omaggio",
      queueEnabled: true,
      avgServiceMinutes: business.avgServiceMinutes,
      subscriptionTier: business.subscriptionTier,
      locale: "it",
      partitaIva: business.partitaIva,
      codiceFiscale: business.codiceFiscale,
      codiceDestinatarioSdi: business.codiceDestinatario,
      regimeFiscale: business.regimeFiscale,
      catalogEnabled: Boolean(business.catalogEnabled),
      depositsEnabled: business.category === "Ristorante" || business.category === "Fiorista",
      depositPercentage: business.category === "Ristorante" ? 25 : 30,
      crossPromoEnabled: true,
      whatsappAiEnabled: true,
      whatsappAiFaqs: JSON.stringify([{ q: "Come prenoto?", a: "Puoi prenotare dal sito o scriverci su WhatsApp." }]),
      websiteVisitsThisMonth: 420 + businessIndex * 115,
    },
  });

  await prisma.membership.create({ data: { id: `membership-${business.slug}-owner`, userId: business.ownerUserId, businessId: business.id, role: "owner" } });

  const staffProfiles = business.staff.map((staff, index) => ({
    id: staff.id,
    businessId: business.id,
    userId: staff.userId,
    name: staff.name,
    role: staff.role,
    color: staff.color,
    email: `${staff.name.split(" ")[0]?.toLowerCase()}.${business.slug}@demo.it`,
    phone: customerPhone(business.customerOffset + 300 + index),
    workingHours: commonWorkingHours,
    serviceIds: JSON.stringify(
      staff.role === "owner"
        ? business.services.map((service) => service.id)
        : staff.role === "manager"
          ? business.services.slice(0, Math.max(3, business.services.length - 1)).map((service) => service.id)
          : business.services.filter((_, serviceIndex) => (serviceIndex + index) % 2 === 0).map((service) => service.id),
    ),
    active: true,
  }));

  await prisma.staffProfile.createMany({ data: staffProfiles });
  await prisma.service.createMany({ data: business.services.map((service) => ({ ...service, businessId: business.id })) });

  const customers = buildCustomers(business);
  await prisma.customer.createMany({ data: customers });

  const bookings = buildBookings(business, customers);
  await prisma.booking.createMany({ data: bookings });
  await prisma.queueEntry.createMany({ data: buildQueues(business, customers) });

  await prisma.review.createMany({
    data: business.reviews.map((review, index) => ({
      id: `review-${business.slug}-${index + 1}`,
      businessId: business.id,
      author: review.author,
      rating: review.rating,
      date: daysAgo(6 + index * 4, 12),
      comment: review.comment,
      responseSuggestion: "Rispondi ringraziando e invitando il cliente a tornare.",
      responded: index % 3 === 0,
      googleReviewId: `google-${business.slug}-${index + 1}`,
    })),
  });

  const { cards, redemptions } = buildLoyalty(business, customers);
  await prisma.loyaltyCard.createMany({ data: cards });
  await prisma.loyaltyRedemption.createMany({ data: redemptions });

  await prisma.whatsappMessage.createMany({ data: buildWhatsApp(business, customers) });
  await prisma.socialPost.createMany({ data: buildSocialPosts(business) });
  await prisma.giftCard.createMany({ data: buildGiftCards(business) });

  const { flows, executions } = buildAutomations(business);
  await prisma.automationFlow.createMany({ data: flows });
  await prisma.flowExecution.createMany({ data: executions });

  const fiscalProfileId = `fiscal-${business.slug}`;
  await prisma.fiscalProfile.create({
    data: {
      id: fiscalProfileId,
      businessId: business.id,
      ragioneSociale: business.name,
      partitaIva: business.partitaIva,
      codiceFiscale: business.codiceFiscale,
      indirizzo: business.address,
      cap: business.city === "Forlì" ? "47121" : business.city === "Cesena" ? "47521" : "48121",
      citta: business.city,
      provincia: business.city === "Ravenna" ? "RA" : "FC",
      codiceDestinatario: business.codiceDestinatario,
      regimeFiscale: business.regimeFiscale,
    },
  });

  const { invoices, lines } = buildInvoices(business, fiscalProfileId, business.services, customers);
  await prisma.invoice.createMany({ data: invoices });
  await prisma.invoiceLine.createMany({ data: lines });

  const { categories, items, orders, orderItems } = buildCatalogOrders(business, business.products, customers);
  if (categories.length) await prisma.productCategory.createMany({ data: categories });
  if (items.length) await prisma.product.createMany({ data: items });
  if (orders.length) await prisma.order.createMany({ data: orders });
  if (orderItems.length) await prisma.orderItem.createMany({ data: orderItems });

  await prisma.notification.createMany({
    data: [
      { id: `notification-${business.slug}-1`, businessId: business.id, type: "booking", title: "Picco prenotazioni weekend", body: "Le prenotazioni del weekend sono sopra la media del 18%.", priority: "normal" },
      { id: `notification-${business.slug}-2`, businessId: business.id, type: "review", title: "Nuove recensioni da gestire", body: "Hai 2 recensioni recenti con suggerimento risposta già pronto.", priority: "normal" },
      { id: `notification-${business.slug}-3`, businessId: business.id, type: "automation", title: "Automazione attiva", body: "Il flusso principale ha inviato con successo i reminder di oggi.", priority: "low" },
    ],
  });

  await prisma.job.createMany({
    data: [
      { id: `job-${business.slug}-1`, businessId: business.id, type: "booking-reminder", status: "completed", priority: 2, payload: JSON.stringify({ total: 8 }), scheduledAt: daysAgo(1, 18), completedAt: daysAgo(1, 18, 2) },
      { id: `job-${business.slug}-2`, businessId: business.id, type: "social-publisher", status: "pending", priority: 1, payload: JSON.stringify({ post: 1 }), scheduledAt: daysFromNow(1, 9) },
      { id: `job-${business.slug}-3`, businessId: business.id, type: "insight-generator", status: "completed", priority: 1, payload: JSON.stringify({ scope: "dashboard" }), scheduledAt: daysAgo(2, 5), completedAt: daysAgo(2, 5, 4) },
    ],
  });

  await prisma.insight.createMany({
    data: [
      { id: `insight-${business.slug}-1`, businessId: business.id, category: "revenue", title: "Finestra di upsell", body: `I clienti ${business.category === "Barbiere" ? "del mattino" : "del pranzo"} acquistano più facilmente extra e servizi accessori.`, actionLabel: "Apri dettagli" },
      { id: `insight-${business.slug}-2`, businessId: business.id, category: "retention", title: "Clienti da ricontattare", body: "Una parte dei clienti fedeli non visita il negozio da oltre 30 giorni.", actionLabel: "Invia campagna" },
    ],
  });

  await prisma.businessHealthScore.create({
    data: {
      id: `health-${business.slug}`,
      businessId: business.id,
      score: 82 + businessIndex * 4,
      riskTier: "healthy",
      loginFrequency7d: 5 + businessIndex,
      loginFrequency30d: 18 + businessIndex * 2,
      featureBreadth: business.catalogEnabled ? 8 : 6,
      bookingTrend: businessIndex === 1 ? "growing" : "stable",
      lastCalculated: daysAgo(0, 6),
    },
  });
}

async function seed() {
  await clearDatabase();
  await prisma.user.createMany({ data: seedData.users.map((user) => ({ ...user, passwordHash: "demo-password-hash" })) });

  for (const [index, business] of seedData.businesses.entries()) {
    await seedBusiness(business, index);
  }

  const [businesses, customers, bookings, reviews, giftCards] = await prisma.$transaction([
    prisma.business.count(),
    prisma.customer.count(),
    prisma.booking.count(),
    prisma.review.count(),
    prisma.giftCard.count(),
  ]);

  console.log(`Seeded ${businesses} demo businesses, ${customers} customers, ${bookings} bookings, ${reviews} reviews and ${giftCards} gift cards.`);
}

seed()
  .catch((error) => {
    console.error("Error seeding bottega-digitale demo data", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
