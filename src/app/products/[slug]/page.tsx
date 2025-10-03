// app/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductCarousel } from "@/components/ProductCarousel";
import { expandImageVariants } from "@/lib/images";
import { AddToCartButton } from "@/components/AddToCartButton"; // ← add this

export const dynamic = "force-dynamic"; // dev only

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { id: true, slug: true, name: true, description: true, priceCents: true, imageUrl: true },
  });
  if (!product) return notFound();

  const candidates = expandImageVariants(product.imageUrl);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">{product.name}</h1>

      <ProductCarousel candidateUrls={candidates} alt={product.name} />

      <p className="mt-4 text-gray-700">{product.description}</p>
      <p className="mt-2 text-lg font-medium">${(product.priceCents / 100).toFixed(2)}</p>

      <div className="mt-4">
        <AddToCartButton productId={product.id} />
      </div>
    </main>
  );
}
