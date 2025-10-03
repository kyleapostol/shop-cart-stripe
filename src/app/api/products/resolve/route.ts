import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Keep Prisma on Node runtime (not Edge)
export const runtime = "nodejs";

// --- Type guards / parsers (no `any`) ---
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function toIdArray(value: unknown): number[] {
  // Accept: number[], string[], or comma-separated string
  let raw: (number | string)[] = [];

  if (Array.isArray(value)) {
    // filter to only strings/numbers
    raw = (value as unknown[]).filter(
      (x): x is number | string => typeof x === "number" || typeof x === "string"
    );
  } else if (typeof value === "string") {
    raw = value.split(",").map((s) => s.trim());
  } else if (typeof value === "number") {
    raw = [value];
  } else {
    return [];
  }

  const nums = raw
    .map((n) => (typeof n === "number" ? n : Number(n)))
    .filter((n) => Number.isFinite(n) && n > 0);

  // dedupe
  return Array.from(new Set(nums));
}

export async function POST(req: NextRequest) {
  // Parse JSON safely as unknown first
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = isRecord(body) ? body : {};

  // ---- Case A: ids[] present -> return many
  if ("ids" in data) {
    const ids = toIdArray(data.ids);
    if (ids.length === 0) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      // adjust fields to your schema if different
      select: { id: true, slug: true, name: true, imageUrl: true, priceCents: true },
    });

    return NextResponse.json({ products }, { status: 200 });
  }

  // ---- Case B: single id or slug
  const idVal = data.id;
  const slugVal = data.slug;

  const id = typeof idVal === "number" ? idVal : typeof idVal === "string" ? Number(idVal) : undefined;
  const slug = typeof slugVal === "string" ? slugVal : undefined;

  if (!Number.isFinite(id) && !slug) {
    return NextResponse.json({ error: "Provide id or slug or ids[]" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: Number.isFinite(id as number) ? { id: id as number } : { slug: slug as string },
    select: { id: true, slug: true, name: true, imageUrl: true, priceCents: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product, { status: 200 });
}
