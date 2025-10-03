// src/app/api/products/resolve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function toIdArray(value: unknown): number[] {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : String(value).split(",");
  const nums = arr
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n > 0);
  return Array.from(new Set(nums));
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;

  // Case A: ids present (array or comma-separated string)
  const ids = "ids" in data ? toIdArray((data as any).ids) : [];
  if (ids.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, slug: true, name: true, imageUrl: true, priceCents: true },
    });
    return NextResponse.json({ products }, { status: 200 });
  }

  // Case B: single id or slug
  const id = Number((data as any).id);
  const slug = typeof (data as any).slug === "string" ? (data as any).slug : undefined;
  if (!Number.isFinite(id) && !slug) {
    return NextResponse.json({ error: "Provide id or slug or ids[]" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: Number.isFinite(id) ? { id } : { slug: slug! },
    select: { id: true, slug: true, name: true, imageUrl: true, priceCents: true },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product, { status: 200 });
}
