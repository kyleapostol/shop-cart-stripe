"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/app/actions/checkout";
import { useCart } from "@/components/CartProvider";

type ProductLite = {
  id: number;
  name: string;
  imageUrl: string;
  priceCents: number;
  slug?: string | null;
};

export default function CheckoutClient() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [products, setProducts] = useState<Record<number, ProductLite>>({});
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();

  const ids = useMemo(() => items.map((i) => i.productId), [items]);

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

  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const canSubmit = items.length > 0 && emailValid && !pending;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-center text-2xl font-semibold">Checkout</h1>
        <div className="rounded-xl border p-6 text-center">
          <p className="text-gray-600">Your cart is empty.</p>
          <Link href="/" className="mt-4 inline-block rounded-lg border px-4 py-2 text-sm">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-semibold">Checkout</h1>

      {/* centered card grid */}
      <div className="flex gap-6">
        {/* Left: Contact */}
        <section className="flex-1 rounded-xl border bg-white p-5">
          <h2 className="mb-4 text-lg font-medium">Contact</h2>

          <label className="mb-1 block text-sm text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"
          />
          {!emailValid && email.length > 0 && (
            <p className="mt-1 text-xs text-red-600">Enter a valid email.</p>
          )}

          {/* Space reserved for address later */}
          {/* <div className="mt-4 grid grid-cols-2 gap-3">...</div> */}
        </section>

        {/* Right: Summary */}
        <aside className="flex-1 rounded-xl border bg-white p-5 md:sticky md:top-6">
          <h2 className="mb-4 text-lg font-medium">Summary</h2>

          <ul className="divide-y rounded-lg border">
            {items.map((it) => {
              const p = products[it.productId];
              const unit = p?.priceCents ?? 0;
              const line = unit * it.quantity;
              return (
                <li key={it.productId} className="flex items-center gap-3 p-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded border bg-gray-50">
                    {p && (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="256px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{p?.name ?? `Product #${it.productId}`}</div>
                    <div className="text-xs text-gray-600">Qty {it.quantity}</div>
                  </div>
                  <div className="text-sm font-medium">
                    ${((line ?? 0) / 100).toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${(subtotalCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>Calculated later</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>${(subtotalCents / 100).toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={!canSubmit}
            onClick={() =>
              start(async () => {
                const res = await placeOrder(
                  items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
                  email
                );
                if (res.ok) {
                  clear();
                  router.push("/orders?success=1");
                }
              })
            }
            className="mt-5 inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm
                       transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Placing order…" : "Place order"}
          </button>

          <Link
            href="/cart"
            className="mt-3 block text-center text-xs text-gray-600 underline underline-offset-4"
          >
            Back to cart
          </Link>
        </aside>
      </div>
    </>
  );
}
