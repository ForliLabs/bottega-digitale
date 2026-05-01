// Seed Script — Demo Data for Bottega Digitale
// Creates 3 realistic Italian demo businesses with full data
// Usage: npx tsx prisma/seed.ts

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

const adapter = new PrismaLibSql(
  tursoUrl
    ? { url: tursoUrl, authToken: tursoToken }
    : { url: "file:prisma/dev.db" },
);

const prisma = new PrismaClient({ adapter });

// ─── Helpers ────────────────────────────────────────────────────

function cuid(): string {
  return `seed_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
}

function randomPhone(): string {
  const prefix = ["+39333", "+39347", "+39389", "+39320", "+39338"][Math.floor(Math.random() * 5)];
  return `${prefix}${Math.floor(1000000 + Math.random() * 9000000)}`;
}

function randomDate(daysBack: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 4) * 15, 0, 0);
  return d;
}

function futureDate(daysAhead: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 4) * 15, 0, 0);
  return d;
}

const ITALIAN_NAMES = [
  "Marco Rossi", "Giulia Bianchi", "Luca Ferrari", "Sofia Romano", "Alessandro Colombo",
  "Chiara Ricci", "Andrea Marino", "Valentina Greco", "Matteo Bruno", "Francesca Costa",
  "Davide Galli", "Elena Conti", "Simone De Luca", "Laura Mancini", "Federico Barbieri",
  "Martina Fontana", "Giovanni Santoro", "Sara Mariani", "Pietro Rinaldi", "Anna Caruso",
  "Roberto Lombardi", "Claudia Moretti", "Stefano Marchetti", "Maria Esposito", "Fabio Leone",
  "Paola Ferrara", "Nicola Serra", "Silvia Pellegrini", "Antonio Vitale", "Elisa Fabbri",
  "Giuseppe Gentile", "Cristina Palumbo", "Emanuele Benedetti", "Ilaria Parisi", "Lorenzo Sala",
  "Barbara De Angelis", "Riccardo Testa", "Monica Neri", "Daniele Grassi", "Roberta Farina",
  "Carlo Marchetti", "Angela De Rosa", "Vincenzo Gatto", "Teresa Ruggiero", "Paolo Amato",
  "Daniela Vitali", "Michele Bernardi", "Patrizia Rizzi", "Franco Basile", "Lucia Olivieri",
];

const OPENING_HOURS = JSON.stringify([
  "Lun 09:00-13:00, 15:00-19:30",
  "Mar 09:00-13:00, 15:00-19:30",
  "Mer 09:00-13:00, 15:00-19:30",
  "Gio 09:00-13:00, 15:00-19:30",
  "Ven 09:00-13:00, 15:00-19:30",
  "Sab 09:00-13:00",
  "Dom Chiuso",
]);

// ─── Seed Data ──────────────────────────────────────────────────

async function seedBarbershop() {
  const businessId = cuid();
  const ownerId = cuid();

  // Owner
  await prisma.user.create({
    data: {
      id: ownerId,
      email: "marco@barberiadeforli.it",
      name: "Marco Bellini",
      passwordHash: "$2b$10$placeholder_hash_barbershop",
      role: "owner",
    },
  });

  // Business
  await prisma.business.create({
    data: {
      id: businessId,
      name: "Barberia Da Marco",
      slug: "barberia-da-marco",
      category: "Barbiere",
      city: "Forlì",
      address: "Via Aurelio Saffi 42, 47121 Forlì FC",
      phone: "+393331234567",
      email: "info@barberiadeforli.it",
      description: "La barberia di riferimento nel cuore di Forlì. Tagli classici e moderni, trattamenti barba, e un ambiente accogliente dove ogni cliente è di casa dal 2005.",
      openingHours: OPENING_HOURS,
      websitePublished: true,
      onlineBookingEnabled: true,
      loyaltyEnabled: true,
      loyaltyPointsPerVisit: 10,
      loyaltyRewardThreshold: 100,
      loyaltyRewardName: "Taglio gratuito",
      queueEnabled: true,
      avgServiceMinutes: 25,
      subscriptionTier: "maestro",
      locale: "it",
      partitaIva: "IT04123456789",
      codiceFiscale: "BLLMRC80A01D704X",
    },
  });

  await prisma.membership.create({
    data: { id: cuid(), userId: ownerId, businessId, role: "owner" },
  });

  // Services
  const services = [
    { name: "Taglio uomo", priceEuro: 18, durationMinutes: 25 },
    { name: "Taglio + barba", priceEuro: 28, durationMinutes: 40 },
    { name: "Barba e baffi", priceEuro: 12, durationMinutes: 20 },
    { name: "Taglio bambino", priceEuro: 12, durationMinutes: 20 },
    { name: "Trattamento capelli", priceEuro: 35, durationMinutes: 45 },
    { name: "Rasatura tradizionale", priceEuro: 22, durationMinutes: 30 },
  ];

  const serviceIds: string[] = [];
  for (const s of services) {
    const id = cuid();
    serviceIds.push(id);
    await prisma.service.create({
      data: { id, businessId, ...s },
    });
  }

  // Customers (50)
  const customerIds: string[] = [];
  for (let i = 0; i < 50; i++) {
    const id = cuid();
    customerIds.push(id);
    await prisma.customer.create({
      data: {
        id,
        businessId,
        name: ITALIAN_NAMES[i],
        phone: randomPhone(),
        email: i < 30 ? `${ITALIAN_NAMES[i].split(" ")[0].toLowerCase()}@email.it` : undefined,
        lastVisit: randomDate(60),
        totalVisits: Math.floor(Math.random() * 20) + 1,
      },
    });
  }

  // Bookings (200) — mix of past completed and future confirmed
  for (let i = 0; i < 200; i++) {
    const isPast = i < 160;
    const serviceIdx = Math.floor(Math.random() * services.length);
    const customerIdx = Math.floor(Math.random() * customerIds.length);
    await prisma.booking.create({
      data: {
        id: cuid(),
        businessId,
        customerId: customerIds[customerIdx],
        serviceId: serviceIds[serviceIdx],
        customerName: ITALIAN_NAMES[customerIdx],
        customerPhone: randomPhone(),
        service: services[serviceIdx].name,
        startsAt: isPast ? randomDate(90) : futureDate(30),
        durationMinutes: services[serviceIdx].durationMinutes,
        status: isPast ? "Completata" : "Confermata",
        channel: ["Sito web", "WhatsApp", "Telefono", "Online"][Math.floor(Math.random() * 4)],
        priceEuro: services[serviceIdx].priceEuro,
      },
    });
  }

  // Reviews (15)
  const reviewComments = [
    "Ottimo taglio, Marco è sempre preciso!",
    "Ambiente accogliente, ci torno sicuramente.",
    "Professionalità al top. Consigliato!",
    "La rasatura tradizionale è un'esperienza unica.",
    "Prezzi onesti e qualità eccellente.",
    "Il miglior barbiere di Forlì, senza dubbio.",
    "Taglio perfetto come sempre, grazie Marco!",
    "Atmosfera rilassante e servizio impeccabile.",
    "Consiglio a tutti, specialmente il trattamento barba.",
    "Sempre soddisfatto. 5 stelle meritate.",
    "Marco è un artista con le forbici!",
    "Servizio veloce e risultato perfetto.",
    "Ho portato anche mio figlio, entrambi contentissimi.",
    "La barba non è mai stata così bella.",
    "Puntuale, preciso, professionale. TOP!",
  ];
  for (let i = 0; i < 15; i++) {
    await prisma.review.create({
      data: {
        id: cuid(),
        businessId,
        author: ITALIAN_NAMES[i],
        rating: Math.random() > 0.2 ? 5 : 4,
        date: randomDate(120),
        comment: reviewComments[i],
      },
    });
  }

  // Loyalty cards for top customers
  for (let i = 0; i < 20; i++) {
    const points = Math.floor(Math.random() * 120);
    await prisma.loyaltyCard.create({
      data: {
        id: cuid(),
        businessId,
        customerId: customerIds[i],
        points,
        totalEarned: points + Math.floor(Math.random() * 50),
      },
    });
  }

  console.log("✅ Barberia Da Marco — 6 servizi, 50 clienti, 200 prenotazioni, 15 recensioni");
  return businessId;
}

async function seedRestaurant() {
  const businessId = cuid();
  const ownerId = cuid();

  await prisma.user.create({
    data: {
      id: ownerId,
      email: "rosa@trattorianonnarosa.it",
      name: "Rosa Marchetti",
      passwordHash: "$2b$10$placeholder_hash_restaurant",
      role: "owner",
    },
  });

  await prisma.business.create({
    data: {
      id: businessId,
      name: "Trattoria Nonna Rosa",
      slug: "trattoria-nonna-rosa",
      category: "Ristorante",
      city: "Forlì",
      address: "Corso della Repubblica 18, 47121 Forlì FC",
      phone: "+393489876543",
      email: "info@trattorianonnarosa.it",
      description: "Cucina romagnola autentica con ricette di famiglia dal 1978. Piadina fatta a mano, passatelli, cappelletti e il miglior ragù della Romagna.",
      openingHours: JSON.stringify([
        "Lun Chiuso",
        "Mar 12:00-14:30, 19:00-22:30",
        "Mer 12:00-14:30, 19:00-22:30",
        "Gio 12:00-14:30, 19:00-22:30",
        "Ven 12:00-14:30, 19:00-23:00",
        "Sab 12:00-14:30, 19:00-23:00",
        "Dom 12:00-15:00",
      ]),
      websitePublished: true,
      onlineBookingEnabled: true,
      catalogEnabled: true,
      subscriptionTier: "bottega",
      locale: "it",
      partitaIva: "IT04987654321",
    },
  });

  await prisma.membership.create({
    data: { id: cuid(), userId: ownerId, businessId, role: "owner" },
  });

  // Products (12)
  const categoryId = cuid();
  await prisma.productCategory.create({
    data: { id: categoryId, businessId, name: "Menu", sortOrder: 0 },
  });

  const products = [
    { name: "Cappelletti in brodo", priceEuro: 10, description: "Pasta fresca ripiena in brodo di cappone" },
    { name: "Passatelli asciutti", priceEuro: 11, description: "Con ragù di salsiccia e funghi porcini" },
    { name: "Tagliatelle al ragù", priceEuro: 10, description: "Ragù di Nonna Rosa, ricetta segreta" },
    { name: "Piadina romagnola", priceEuro: 7, description: "Fatta a mano, farcita con squacquerone e rucola" },
    { name: "Coniglio alla romagnola", priceEuro: 14, description: "Con patate al forno e rosmarino" },
    { name: "Grigliata mista", priceEuro: 16, description: "Costata, salsiccia, braciola e verdure" },
    { name: "Insalata dell'orto", priceEuro: 8, description: "Verdure di stagione dell'orto della nonna" },
    { name: "Zuppa inglese", priceEuro: 6, description: "Dolce tradizionale con alchermes e crema" },
    { name: "Tiramisù della casa", priceEuro: 6, description: "Con mascarpone fresco e caffè" },
    { name: "Sangiovese DOC (calice)", priceEuro: 4, description: "Vino rosso locale di Predappio" },
    { name: "Acqua minerale", priceEuro: 2, description: "Naturale o frizzante" },
    { name: "Caffè espresso", priceEuro: 1.5, description: "Miscela artigianale" },
  ];

  const productIds: string[] = [];
  for (const p of products) {
    const id = cuid();
    productIds.push(id);
    await prisma.product.create({
      data: { id, businessId, categoryId, ...p, isAvailable: true },
    });
  }

  // Orders (80)
  for (let i = 0; i < 80; i++) {
    const orderId = cuid();
    const numItems = 1 + Math.floor(Math.random() * 3);
    const selectedProducts = Array.from({ length: numItems }, () =>
      products[Math.floor(Math.random() * products.length)]
    );
    const total = selectedProducts.reduce((s, p) => s + p.priceEuro, 0);

    await prisma.order.create({
      data: {
        id: orderId,
        businessId,
        customerName: ITALIAN_NAMES[Math.floor(Math.random() * ITALIAN_NAMES.length)],
        customerPhone: randomPhone(),
        status: ["ricevuto", "pronto", "consegnato"][Math.floor(Math.random() * 3)],
        totalEuro: total,
        paymentStatus: i < 60 ? "paid" : "pending",
        createdAt: randomDate(60),
      },
    });

    for (const sp of selectedProducts) {
      const pidx = products.indexOf(sp);
      await prisma.orderItem.create({
        data: {
          id: cuid(),
          orderId,
          productId: productIds[pidx],
          quantity: 1,
          unitPrice: sp.priceEuro,
        },
      });
    }
  }

  // Reviews (8)
  const reviewComments = [
    "I cappelletti più buoni di tutta la Romagna!",
    "Come mangiare a casa della nonna. Fantastico.",
    "Piadina perfetta, servizio caloroso.",
    "Ragù spettacolare, ci torno ogni settimana.",
    "Ottimo rapporto qualità/prezzo. Ambiente familiare.",
    "La zuppa inglese è da 10 e lode!",
    "Prenotazione facile, servizio impeccabile.",
    "Una vera trattoria romagnola. Imperdibile a Forlì.",
  ];
  for (let i = 0; i < 8; i++) {
    await prisma.review.create({
      data: {
        id: cuid(),
        businessId,
        author: ITALIAN_NAMES[i + 15],
        rating: Math.random() > 0.15 ? 5 : 4,
        date: randomDate(90),
        comment: reviewComments[i],
      },
    });
  }

  console.log("✅ Trattoria Nonna Rosa — 12 prodotti, 80 ordini, 8 recensioni");
  return businessId;
}

async function seedFlorist() {
  const businessId = cuid();
  const ownerId = cuid();

  await prisma.user.create({
    data: {
      id: ownerId,
      email: "elena@fioristaginasole.it",
      name: "Elena Fabbri",
      passwordHash: "$2b$10$placeholder_hash_florist",
      role: "owner",
    },
  });

  await prisma.business.create({
    data: {
      id: businessId,
      name: "Fiorista Girasole",
      slug: "fiorista-girasole",
      category: "Fiorista",
      city: "Forlì",
      address: "Piazza Aurelio Saffi 7, 47121 Forlì FC",
      phone: "+393201112233",
      email: "info@fioristaginasole.it",
      description: "Bouquet artigianali, composizioni floreali per eventi e consegna a domicilio a Forlì. Fiori freschi ogni giorno dal mercato di Bologna.",
      openingHours: JSON.stringify([
        "Lun 09:00-13:00, 15:30-19:00",
        "Mar 09:00-13:00, 15:30-19:00",
        "Mer 09:00-13:00, 15:30-19:00",
        "Gio 09:00-13:00, 15:30-19:00",
        "Ven 09:00-13:00, 15:30-19:00",
        "Sab 09:00-13:00",
        "Dom Chiuso",
      ]),
      websitePublished: true,
      catalogEnabled: true,
      subscriptionTier: "bottega",
      locale: "it",
    },
  });

  await prisma.membership.create({
    data: { id: cuid(), userId: ownerId, businessId, role: "owner" },
  });

  // Products (8)
  const categoryId = cuid();
  await prisma.productCategory.create({
    data: { id: categoryId, businessId, name: "Bouquet & Composizioni", sortOrder: 0 },
  });

  const products = [
    { name: "Bouquet di rose rosse", priceEuro: 35, description: "12 rose rosse a gambo lungo con verde decorativo" },
    { name: "Composizione primavera", priceEuro: 28, description: "Tulipani, narcisi e ranuncoli di stagione" },
    { name: "Bouquet misto del giorno", priceEuro: 22, description: "Fiori freschi selezionati dal fiorista" },
    { name: "Orchidea in vaso", priceEuro: 45, description: "Phalaenopsis bianca con cachepot in ceramica" },
    { name: "Centrotavola elegante", priceEuro: 55, description: "Composizione bassa per tavolo con fiori di stagione" },
    { name: "Bouquet da sposa", priceEuro: 85, description: "Su misura, consulenza inclusa" },
    { name: "Pianta grassa set", priceEuro: 18, description: "Set di 3 succulente in vasetti decorativi" },
    { name: "Corona funebre", priceEuro: 120, description: "Con nastro personalizzato e consegna" },
  ];

  const productIds: string[] = [];
  for (const p of products) {
    const id = cuid();
    productIds.push(id);
    await prisma.product.create({
      data: { id, businessId, categoryId, ...p, isAvailable: true },
    });
  }

  // Orders (30)
  for (let i = 0; i < 30; i++) {
    const orderId = cuid();
    const pIdx = Math.floor(Math.random() * products.length);
    await prisma.order.create({
      data: {
        id: orderId,
        businessId,
        customerName: ITALIAN_NAMES[Math.floor(Math.random() * ITALIAN_NAMES.length)],
        customerPhone: randomPhone(),
        status: "consegnato",
        totalEuro: products[pIdx].priceEuro,
        paymentStatus: "paid",
        createdAt: randomDate(90),
      },
    });
    await prisma.orderItem.create({
      data: {
        id: cuid(),
        orderId,
        productId: productIds[pIdx],
        quantity: 1,
        unitPrice: products[pIdx].priceEuro,
      },
    });
  }

  console.log("✅ Fiorista Girasole — 8 prodotti, 30 ordini");
  return businessId;
}

// ─── Main Seed Runner ───────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Bottega Digitale demo data...\n");
  const start = Date.now();

  try {
    await seedBarbershop();
    await seedRestaurant();
    await seedFlorist();

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n✨ Seed completato in ${elapsed}s`);
    console.log("   Attività demo pronte per presentazioni e test.\n");
  } catch (err) {
    console.error("❌ Errore durante il seeding:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
