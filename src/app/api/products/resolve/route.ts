import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ids: unknown[] = Array.isArray((body as any).ids) ? (body as any).ids : [];
  const uniqueIds = [...new Set(ids)].map(Number).filter(Number.isFinite);

  if (uniqueIds.length === 0) return Response.json({ products: [] });

  const products = await prisma.product.findMany({
    where: { id: { in: uniqueIds as number[] } },
    select: { id: true, name: true, imageUrl: true, priceCents: true, slug: true },
  });

  return Response.json({ products });
}
