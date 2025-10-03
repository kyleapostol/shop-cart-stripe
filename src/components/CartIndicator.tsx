"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { FiShoppingCart } from "react-icons/fi";

export function CartIndicator() {
  const { items } = useCart();
  const [mounted, setMounted] = useState(false); // avoid SSR mismatch with localStorage cart
  useEffect(() => setMounted(true), []);

  const count = items.reduce((n, it) => n + it.quantity, 0);

  return (
    <Link href="/cart" className="relative inline-flex items-center">
      <FiShoppingCart className="h-5 w-5" />
      <span className="sr-only">Cart</span>

      {mounted && count > 0 && (
        <span
          className="absolute -right-2 -top-2 min-w-5 h-5 rounded-full bg-black px-1
                     text-center text-[11px] leading-5 text-white"
          aria-label={`${count} items in cart`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
