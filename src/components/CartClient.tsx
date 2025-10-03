"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import type { CartItem } from "@/types/cart";

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

  useEffect(() => {
    let abort = false;
    async function load() {
      if (!ids.length) {
        setProducts({});
        return;
      }
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
    }
    load();
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
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Your Cart</h1>
        <p className="text-gray-600">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block rounded-lg border px-4 py-2 text-sm">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
        <button className="rounded-lg border px-3 py-1 text-sm" onClick={clear}>
          Clear cart
        </button>
      </div>

      <ul className="divide-y rounded-xl border">
        {items.map((it) => {
          const p = products[it.productId];
          return (
            <li key={it.productId} className="flex items-center gap-4 p-4">
              {p ? (
                <>
                  <Link
                    href={`/products/${p.slug ?? p.id}`}
                    className="block overflow-hidden rounded-md"
                    aria-label={`View details for ${p.name}`}
                  >
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      width={96}
                      height={96}
                      className="h-24 w-24 object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link href={`/products/${p.slug ?? p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                    <div className="text-gray-600">
                      ${(p.priceCents / 100).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="h-8 w-8 rounded border"
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
                        if (!Number.isFinite(v) || v < 1) return;
                        setQty(it.productId, v);
                      }}
                      className="h-8 w-14 rounded border px-2 text-center"
                    />
                    <button
                      className="h-8 w-8 rounded border"
                      onClick={() => setQty(it.productId, it.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-24 text-right font-medium">
                    {p ? `$${((p.priceCents * it.quantity) / 100).toFixed(2)}` : "—"}
                  </div>

                  <button
                    className="ml-2 rounded-lg border px-3 py-1 text-sm"
                    onClick={() => remove(it.productId)}
                    aria-label="Remove item"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="h-24 w-24 rounded bg-gray-100" />
                  <div className="flex-1 text-gray-500">Product #{it.productId} (details unavailable)</div>
                  <div className="w-24 text-right">—</div>
                  <button className="ml-2 rounded-lg border px-3 py-1 text-sm" onClick={() => remove(it.productId)}>
                    Remove
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center justify-end gap-6">
        <div className="text-lg">
          Subtotal: <span className="font-semibold">${(subtotalCents / 100).toFixed(2)}</span>
        </div>
        <button className="rounded-lg border px-4 py-2 text-sm">Checkout</button>
      </div>
    </div>
  );
}
