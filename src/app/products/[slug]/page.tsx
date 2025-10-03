// app/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductCarousel } from "@/components/ProductCarousel";
import { expandImageVariants } from "@/lib/images";
import { ProductActions } from "@/components/ProductActions";


export const dynamic = "force-dynamic"; // dev only

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>; // ← Next 15: params is a Promise
}) {
  const { slug } = await params; // ← must await in Next 15

  const product = await prisma.product.findUnique({
    where: { slug }, // ← ensure spacing and key
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      priceCents: true,
      imageUrl: true,
      color: true

    },
  });

  if (!product) return notFound();

  const candidates = expandImageVariants(product.imageUrl);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">{product.name}</h1>
      <p className="mb-4 text-sm font-light">{`Color: ${product.color}`}</p>
      <ProductCarousel candidateUrls={candidates} alt={product.name} />
      <p className="mt-4 text-gray-700">{product.description}</p>
      <p className="mt-2 text-lg font-medium">${(product.priceCents / 100).toFixed(2)}</p>
      <ProductActions productId={product.id} />
    </main>
  );
}
