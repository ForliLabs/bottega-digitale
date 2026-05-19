// Product Catalog & Storefront Service
// Manages products, categories, orders for businesses selling physical goods

import { prisma } from "@/lib/prisma";
export {
  formatPrice,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from "@/lib/product-catalog-ui";
export type { OrderStatus } from "@/lib/product-catalog-ui";

// ─── Product Management ─────────────────────────────────────────

export async function getProductCatalog(businessId: string) {
  const categories = await prisma.productCategory.findMany({
    where: { businessId },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const uncategorized = await prisma.product.findMany({
    where: { businessId, categoryId: null, isAvailable: true },
    orderBy: { sortOrder: "asc" },
  });

  return { categories, uncategorized };
}

export async function getProductStats(businessId: string) {
  const totalProducts = await prisma.product.count({ where: { businessId } });
  const activeProducts = await prisma.product.count({
    where: { businessId, isAvailable: true },
  });
  const lowStock = await prisma.product.count({
    where: { businessId, stock: { gt: 0, lte: 5 } },
  });
  const categories = await prisma.productCategory.count({ where: { businessId } });

  const orders = await prisma.order.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { items: { include: { product: true } } },
  });

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalEuro, 0);

  return {
    totalProducts,
    activeProducts,
    lowStock,
    categories,
    recentOrders: orders,
    totalRevenue,
  };
}

// ─── Order Management ───────────────────────────────────────────

export async function createOrder(params: {
  businessId: string;
  customerName: string;
  customerPhone?: string;
  channel: string;
  items: Array<{ productId: string; quantity: number }>;
  notes?: string;
}) {
  if (!params.items.length) {
    throw new Error("L'ordine deve contenere almeno un prodotto.");
  }

  // Scope product lookup by businessId to prevent cross-tenant references
  const products = await prisma.product.findMany({
    where: {
      id: { in: params.items.map((i) => i.productId) },
      businessId: params.businessId,
    },
  });

  // Reject if any requested product doesn't belong to this business
  const foundIds = new Set(products.map((p) => p.id));
  const missingIds = params.items
    .map((i) => i.productId)
    .filter((id) => !foundIds.has(id));
  if (missingIds.length > 0) {
    throw new Error(`Prodotti non trovati o non appartenenti a questa attività: ${missingIds.join(", ")}`);
  }

  const totalEuro = params.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + product.priceEuro * item.quantity;
  }, 0);

  // Wrap order creation + stock decrement in a transaction
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        businessId: params.businessId,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        channel: params.channel,
        totalEuro,
        notes: params.notes,
        items: {
          create: params.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product.priceEuro,
            };
          }),
        },
      },
      include: { items: true },
    });

    // Decrement stock for items with tracked stock
    for (const item of params.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock > 0) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return order;
  });
}

// ─── Public Storefront ──────────────────────────────────────────

export async function getStorefrontData(slug: string) {
  const business = await prisma.business.findUnique({
    where: { slug },
  });
  if (!business || !business.catalogEnabled) return null;

  const catalog = await getProductCatalog(business.id);
  return { business, ...catalog };
}

