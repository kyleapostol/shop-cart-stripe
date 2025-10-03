import Link from "next/link";
import Image from "next/image";
import { prisma } from '@/lib/db'

export default async function Page() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, name: true, description: true, priceCents: true, imageUrl: true },
  });
  console.log('products', products)
  return (
    <div>
      <h1 className="text-2xl mb-4">Products</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const href = `/products/${p.slug}`;
          return (
            <div key={p.id} className="rounded-xl border p-4 shadow-sm">
              <Link
                href={href}
                className="block focus:outline-none focus:ring-2 focus:ring-black/20 rounded-lg"
                aria-label={`View details for ${p.name}`}
              >
                {/* next/image prevents CLS */}
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  width={800}
                  height={600}
                  className="w-full h-40 object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={false}
                />
                <div className="mt-2 font-semibold">{p.name}</div>
                <div className="my-2 text-base font-medium">
                  ${(p.priceCents / 100).toFixed(2)}
                </div>
              </Link>

            </div>
          );
        })}
      </div>
    </div>
  );
}

