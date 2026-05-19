export type OrderStatus = "ricevuto" | "in_preparazione" | "pronto" | "consegnato" | "cancellato";

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  ricevuto: "in_preparazione",
  in_preparazione: "pronto",
  pronto: "consegnato",
  consegnato: null,
  cancellato: null,
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  ricevuto: "Ricevuto",
  in_preparazione: "In preparazione",
  pronto: "Pronto",
  consegnato: "Consegnato",
  cancellato: "Cancellato",
};

export const ORDER_STATUS_STYLES: Record<string, string> = {
  ricevuto: "bg-blue-100 text-blue-700",
  in_preparazione: "bg-amber-100 text-amber-700",
  pronto: "bg-green-100 text-green-700",
  consegnato: "bg-slate-100 text-slate-600",
  cancellato: "bg-red-100 text-red-700",
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}
