"use server";

import { prisma } from "@/lib/db";

type Item = { productId: number; quantity: number };

export async function placeOrder(items: Item[], email: string) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false as const, error: "EMPTY_CART" as const };
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false as const, error: "INVALID_EMAIL" as const };
  }

  // Recalculate prices server-side
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, priceCents: true },
  });
  const priceById = new Map(products.map((p) => [p.id, p.priceCents]));

  const rowData = items.map((i) => {
    const unit = priceById.get(i.productId);
    if (unit == null) throw new Error(`Product ${i.productId} not found`);
    return { productId: i.productId, quantity: i.quantity, unitPriceCents: unit };
  });

  const amountCents = rowData.reduce((s, r) => s + r.unitPriceCents * r.quantity, 0);

  const order = await prisma.order.create({
    data: {
      email,
      status: "PAID",            // demo: mark paid; change to PENDING if you add Stripe later
      amountCents,
      items: { create: rowData },
    },
    select: { id: true },
  });

  return { ok: true as const, id: order.id };
}
