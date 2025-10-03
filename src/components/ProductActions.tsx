"use client";

import { useState } from "react";
import { SizePicker } from "@/components/SizePicker";
import { useCart } from "@/components/CartProvider";

export function ProductActions({ productId }: { productId: number }) {
  const { add } = useCart();
  const [size, setSize] = useState<number | null>(null);

  return (
    <div className="mt-4 space-y-3">
      <SizePicker value={size} onChange={setSize} />

      <button
        disabled={size == null}
        onClick={() => {
          // TODO: if you want to persist size in the cart,
          // we can extend CartItem to include `size`.
          add(productId, 1);
        }}
        className="inline-flex items-center rounded-lg border px-4 py-2 text-sm
                   disabled:cursor-not-allowed disabled:opacity-50"
      >
        {size == null ? "Select a size" : `Add size ${size} to cart`}
      </button>
    </div>
  );
}
