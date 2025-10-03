// import { prisma } from "@/lib/db";

// export async function POST(req: Request) {
//   let body: unknown;
//   try {
//     body = await req.json();
//   } catch {
//     return Response.json({ products: [] });
//   }

//   const ids = Array.isArray((body as any)?.ids) ? (body as any).ids : [];
//   const uniqueIds = [...new Set(ids)]
//     .map((n) => Number(n))
//     .filter((n) => Number.isFinite(n));

//   if (uniqueIds.length === 0) return Response.json({ products: [] });

//   const products = await prisma.product.findMany({
//     where: { id: { in: uniqueIds } },
//     select: { id: true, name: true, imageUrl: true, priceCents: true, slug: true },
//   });

//   return Response.json({ products });
// }
