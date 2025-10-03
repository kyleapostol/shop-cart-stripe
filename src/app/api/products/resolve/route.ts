// src/app/api/products/resolve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type ResolveBody = {
  id?: number;
  slug?: string;
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, slug } = (body as Partial<ResolveBody>) ?? {};

  if (!id && !slug) {
    return NextResponse.json({ error: "Provide id or slug" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: id ? { id: Number(id) } : { slug: String(slug) },
    select: { id: true, slug: true, name: true, priceCents: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
