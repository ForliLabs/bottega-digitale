import { InMemoryStore } from "@/lib/db";

export interface Booking extends Record<string, unknown> {
  id: string;
  customerName: string;
  service: string;
  startsAt: string;
  durationMinutes: number;
  status: "Confermata" | "In attesa" | "Completata";
  channel: "Sito web" | "WhatsApp" | "Instagram" | "Telefono";
  priceEuro: number;
  notes?: string;
}

export interface Customer extends Record<string, unknown> {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  totalVisits: number;
  loyaltyPoints: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  responseSuggestion: string;
}

export interface BusinessProfile {
  name: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  websiteVisitsThisMonth: number;
  bookingLeadTime: string;
  openingHours: string[];
  services: Array<{
    name: string;
    price: string;
    duration: string;
  }>;
}

function shiftDate(daysFromToday: number, hour: number, minute: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function daysAgo(days: number, hour = 11, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const businessProfile: BusinessProfile = {
  name: "Barbiere da Marco",
  category: "Barbiere di quartiere",
  city: "Forlì",
  address: "Via delle Torri 18, 47121 Forlì FC",
  phone: "+39 0543 191919",
  email: "ciao@barbieredamarco.it",
  description:
    "Tagli curati, barbe precise e prenotazioni semplici per chi vive e lavora a Forlì.",
  websiteVisitsThisMonth: 1284,
  bookingLeadTime: "24 ore",
  openingHours: [
    "Lunedì chiuso",
    "Martedì–Venerdì 08:30–19:30",
    "Sabato 08:00–18:00",
    "Domenica chiuso",
  ],
  services: [
    { name: "Taglio classico", price: "€22", duration: "30 min" },
    { name: "Barba modellata", price: "€15", duration: "20 min" },
    { name: "Taglio + barba", price: "€34", duration: "50 min" },
    { name: "Ritocco veloce", price: "€12", duration: "15 min" },
  ],
};

export const sampleBookings: Booking[] = [
  {
    id: "booking-001",
    customerName: "Luca Bernabei",
    service: "Taglio classico",
    startsAt: shiftDate(0, 9, 0),
    durationMinutes: 30,
    status: "Confermata",
    channel: "Sito web",
    priceEuro: 22,
    notes: "Preferisce taglio sfumato ai lati.",
  },
  {
    id: "booking-002",
    customerName: "Matteo Fabbri",
    service: "Taglio + barba",
    startsAt: shiftDate(0, 11, 30),
    durationMinutes: 50,
    status: "Confermata",
    channel: "WhatsApp",
    priceEuro: 34,
  },
  {
    id: "booking-003",
    customerName: "Davide Conti",
    service: "Ritocco veloce",
    startsAt: shiftDate(0, 16, 15),
    durationMinutes: 15,
    status: "In attesa",
    channel: "Instagram",
    priceEuro: 12,
  },
  {
    id: "booking-004",
    customerName: "Gabriele Ravaioli",
    service: "Barba modellata",
    startsAt: shiftDate(1, 10, 0),
    durationMinutes: 20,
    status: "Confermata",
    channel: "Telefono",
    priceEuro: 15,
  },
  {
    id: "booking-005",
    customerName: "Nicola Rossi",
    service: "Taglio classico",
    startsAt: shiftDate(1, 14, 30),
    durationMinutes: 30,
    status: "Confermata",
    channel: "Sito web",
    priceEuro: 22,
  },
  {
    id: "booking-006",
    customerName: "Andrea Miserocchi",
    service: "Taglio + barba",
    startsAt: shiftDate(2, 9, 45),
    durationMinutes: 50,
    status: "Confermata",
    channel: "WhatsApp",
    priceEuro: 34,
  },
  {
    id: "booking-007",
    customerName: "Filippo Casadei",
    service: "Ritocco veloce",
    startsAt: shiftDate(2, 17, 0),
    durationMinutes: 15,
    status: "Confermata",
    channel: "Instagram",
    priceEuro: 12,
  },
  {
    id: "booking-008",
    customerName: "Samuele Valentini",
    service: "Taglio classico",
    startsAt: shiftDate(3, 12, 0),
    durationMinutes: 30,
    status: "Confermata",
    channel: "Sito web",
    priceEuro: 22,
  },
  {
    id: "booking-009",
    customerName: "Pietro Minguzzi",
    service: "Barba modellata",
    startsAt: shiftDate(4, 15, 15),
    durationMinutes: 20,
    status: "Confermata",
    channel: "Telefono",
    priceEuro: 15,
  },
  {
    id: "booking-010",
    customerName: "Alberto Bassi",
    service: "Taglio + barba",
    startsAt: shiftDate(5, 10, 30),
    durationMinutes: 50,
    status: "In attesa",
    channel: "Sito web",
    priceEuro: 34,
    notes: "Prima visita.",
  },
];

export const sampleCustomers: Customer[] = [
  {
    id: "customer-001",
    name: "Luca Bernabei",
    phone: "+39 333 1045201",
    lastVisit: daysAgo(2),
    totalVisits: 9,
    loyaltyPoints: 110,
  },
  {
    id: "customer-002",
    name: "Matteo Fabbri",
    phone: "+39 334 2284104",
    lastVisit: daysAgo(6),
    totalVisits: 5,
    loyaltyPoints: 60,
  },
  {
    id: "customer-003",
    name: "Davide Conti",
    phone: "+39 348 9011442",
    lastVisit: daysAgo(1),
    totalVisits: 2,
    loyaltyPoints: 25,
  },
  {
    id: "customer-004",
    name: "Gabriele Ravaioli",
    phone: "+39 320 5518230",
    lastVisit: daysAgo(14),
    totalVisits: 11,
    loyaltyPoints: 140,
  },
  {
    id: "customer-005",
    name: "Nicola Rossi",
    phone: "+39 347 1257784",
    lastVisit: daysAgo(20),
    totalVisits: 1,
    loyaltyPoints: 10,
  },
  {
    id: "customer-006",
    name: "Andrea Miserocchi",
    phone: "+39 331 4488123",
    lastVisit: daysAgo(4),
    totalVisits: 1,
    loyaltyPoints: 10,
  },
  {
    id: "customer-007",
    name: "Filippo Casadei",
    phone: "+39 349 7001182",
    lastVisit: daysAgo(8),
    totalVisits: 7,
    loyaltyPoints: 85,
  },
  {
    id: "customer-008",
    name: "Alberto Bassi",
    phone: "+39 335 6600912",
    lastVisit: daysAgo(3),
    totalVisits: 1,
    loyaltyPoints: 10,
  },
];

export const sampleReviews: Review[] = [
  {
    id: "review-001",
    author: "Sara Monti",
    rating: 5,
    date: daysAgo(3, 18, 30),
    comment: "Prenotato in due minuti, taglio perfetto e ambiente super curato.",
    responseSuggestion:
      "Grazie Sara! Ci fa piacere sapere che la prenotazione online ti abbia fatto risparmiare tempo. Ti aspettiamo presto in bottega.",
  },
  {
    id: "review-002",
    author: "Marco Liverani",
    rating: 5,
    date: daysAgo(9, 19, 10),
    comment: "Ottimo servizio, orario rispettato e barba fatta davvero bene.",
    responseSuggestion:
      "Grazie Marco, puntualità e cura dei dettagli sono il nostro biglietto da visita. Alla prossima barba modellata!",
  },
  {
    id: "review-003",
    author: "Elena Foschi",
    rating: 4,
    date: daysAgo(12, 17, 45),
    comment: "Molto comodo il promemoria automatico. Mio figlio è uscito felicissimo.",
    responseSuggestion:
      "Grazie Elena! Siamo felici che i promemoria automatici abbiano reso tutto più semplice. Un saluto al piccolo campione!",
  },
  {
    id: "review-004",
    author: "Riccardo Bellini",
    rating: 5,
    date: daysAgo(18, 13, 0),
    comment: "Finalmente un barbiere a Forlì con sito chiaro, prezzi trasparenti e prenotazione rapida.",
    responseSuggestion:
      "Grazie Riccardo, abbiamo creato il sito proprio per offrire chiarezza e velocità. A presto da Barbiere da Marco!",
  },
  {
    id: "review-005",
    author: "Chiara Severi",
    rating: 5,
    date: daysAgo(23, 20, 20),
    comment: "Ho regalato una prenotazione a mio marito: esperienza impeccabile.",
    responseSuggestion:
      "Grazie Chiara! Che bello sapere che l'esperienza sia stata apprezzata anche come regalo. Vi aspettiamo di nuovo.",
  },
];

export const bookingsStore = new InMemoryStore<Booking>();
bookingsStore.seed(sampleBookings);

export const customersStore = new InMemoryStore<Customer>();
customersStore.seed(sampleCustomers);

function isSameDay(left: string, right: Date) {
  const leftDate = new Date(left);
  return (
    leftDate.getDate() === right.getDate() &&
    leftDate.getMonth() === right.getMonth() &&
    leftDate.getFullYear() === right.getFullYear()
  );
}

export function calculateAverageRating(reviews: Review[]) {
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
}

export function calculateDashboardMetrics(
  bookings: Booking[],
  customers: Customer[],
  reviews: Review[]
) {
  return {
    websiteVisits: businessProfile.websiteVisitsThisMonth,
    bookingsToday: bookings.filter((booking) => isSameDay(booking.startsAt, new Date())).length,
    newCustomersThisMonth: customers.filter((customer) => customer.totalVisits === 1).length,
    averageRating: calculateAverageRating(reviews),
    reviewsCount: reviews.length,
  };
}

export function createDemoId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
