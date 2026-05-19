export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { ProductsWorkspace } from "./products-workspace";

export default async function ProductsPage() {
  const business = await getBusinessContext();

  if (!business) {
    return null;
  }

  const [products, orders] = await Promise.all([
    prisma.product.findMany({
      where: { businessId: business.id },
      orderBy: [{ isAvailable: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.order.findMany({
      where: { businessId: business.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <ProductsWorkspace
      business={{
        id: business.id,
        slug: business.slug,
        catalogEnabled: business.catalogEnabled,
      }}
      initialProducts={products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        priceEuro: product.priceEuro,
        imageUrl: product.imageUrl,
        stock: product.stock,
        isAvailable: product.isAvailable,
      }))}
      initialOrders={orders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        channel: order.channel,
        status: order.status,
        totalEuro: order.totalEuro,
        createdAt: order.createdAt.toISOString(),
        notes: order.notes,
        itemsSummary: order.items.map((item) => `${item.quantity}x ${item.product.name}`),
      }))}
    />
  );
}
