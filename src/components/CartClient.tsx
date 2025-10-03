"use client";

import Image from "next/image";              
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useCart } from "@/components/CartProvider";
import { useRouter } from "next/navigation";

type ProductLite = {
  id: number;
  name: string;
  imageUrl: string;
  priceCents: number;
  slug?: string | null;
};

export default function CartClient() {
  const { items, setQty, remove, clear } = useCart();
  const [products, setProducts] = useState<Record<number, ProductLite>>({});
  const ids = useMemo(() => items.map((i) => i.productId), [items]);

  const router = useRouter();


  useEffect(() => {
    let abort = false;
    (async () => {
      if (!ids.length) return setProducts({});
      const res = await fetch("/api/products/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = (await res.json()) as { products: ProductLite[] };
      if (!abort) {
        const map: Record<number, ProductLite> = {};
        for (const p of data.products) map[p.id] = p;
        setProducts(map);
      }
    })();
    return () => {
      abort = true;
    };
  }, [ids]);

  const subtotalCents = items.reduce((sum, it) => {
    const p = products[it.productId];
    return sum + (p ? p.priceCents * it.quantity : 0);
  }, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <h1 className="mb-4 text-2xl font-semibold">Your Cart</h1>
        <p className="text-gray-600">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block rounded-lg border px-4 py-2 text-sm">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:max-w-3xl sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
        <button className="rounded-lg border px-3 py-1 text-sm" onClick={clear}>
          Clear cart
        </button>
      </div>

      <ul className="divide-y rounded-xl border bg-white">
        {items.map((it) => {
          const p = products[it.productId];
          const unit = p ? p.priceCents : 0;
          const line = unit * it.quantity;

          return (
            <li
              key={it.productId}
              className="grid items-center gap-3 p-4
                         sm:grid-cols-[96px_minmax(0,1fr)_auto_auto_auto] sm:gap-4"
            >
              {/* thumbnail */}
              <div className="row-span-2 sm:row-span-1">
                {p ? (
                  <Link
                    href={`/products/${p.slug ?? p.id}`}
                    className="relative block h-24 w-24 overflow-hidden rounded border bg-gray-50"
                    aria-label={`View ${p.name}`}
                  >
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      sizes="256px"                 // rendered size to avoid blurry picks
                      className="object-cover"
                      priority={false}
                    />
                  </Link>
                ) : (
                  <div className="h-24 w-24 rounded border bg-gray-100" />
                )}
              </div>

              {/* title + unit price */}
              <div className="min-w-0">
                <div className="truncate font-medium">{p?.name ?? `Product #${it.productId}`}</div>
                <div className="text-sm text-gray-600">{p ? `$${(unit / 100).toFixed(2)}` : "—"}</div>
              </div>

              {/* qty control */}
              <div className="justify-self-start sm:justify-self-center">
                <div className="inline-flex items-center overflow-hidden rounded-lg border">
                  <button
                    className="h-9 w-9 leading-9"
                    onClick={() => setQty(it.productId, Math.max(1, it.quantity - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (Number.isFinite(v) && v >= 1) setQty(it.productId, v);
                    }}
                    className="h-9 w-12 border-x px-2 text-center"
                  />
                  <button
                    className="h-9 w-9 leading-9"
                    onClick={() => setQty(it.productId, it.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* line total (hidden on xs; shown under title below) */}
              <div className="hidden w-24 justify-self-end text-right font-medium sm:block">
                {p ? `$${(line / 100).toFixed(2)}` : "—"}
              </div>

              {/* remove */}
              <div className="justify-self-end">
                <button
                  onClick={() => remove(it.productId)}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm max-sm:px-2 max-sm:py-2"
                >
                  <span className="sm:hidden">
                    <FiTrash2 className="h-4 w-4" />
                  </span>
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>

              {/* line total on mobile (stacked) */}
              <div className="mt-1 text-right font-medium sm:hidden">
                {p ? `$${(line / 100).toFixed(2)}` : "—"}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="text-lg">
          Subtotal: <span className="font-semibold">${(subtotalCents / 100).toFixed(2)}</span>
        </div>
        <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => router.push("/checkout")}>
          Checkout
        </button>
      </div>
    </div>
  );
}
