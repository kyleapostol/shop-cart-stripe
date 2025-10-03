// app/api/db-check/route.ts
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  const [count] = await Promise.all([
    prisma.product.count(),
  ]);

  // only print non-secret parts of the URL
  const u = new URL(process.env.DATABASE_URL!);
  return Response.json({
    host: u.host,
    db: u.pathname,     
    product_count: count,
  });
}
