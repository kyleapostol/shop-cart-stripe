"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types/cart";

type CartCtxValue = {
  items: CartItem[];
  add:    (productId: number, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear:  () => void;
};

const CartCtx = createContext<CartCtxValue>({
  items: [],
  add: () => {},
  remove: () => {},
  setQty: () => {},
  clear: () => {},
});

const KEY = "ecom-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // hydrate from storage and normalize ids → number
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Array<{ productId: unknown; quantity: unknown }>;
      const normalized: CartItem[] = parsed
        .map((p) => ({
          productId: typeof p.productId === "string" ? Number(p.productId) : Number(p.productId),
          quantity: typeof p.quantity === "string" ? Number(p.quantity) : Number(p.quantity),
        }))
        .filter((p) => Number.isFinite(p.productId) && Number.isFinite(p.quantity) && p.quantity > 0);
      setItems(normalized);
    } catch {
      // ignore corrupt storage
    }
  }, []);

  // persist
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  // core ops (number ids)
  const _add = (productId: number, qty = 1) =>
    setItems((prev) => {
      const i = prev.findIndex((p) => p.productId === productId);
      if (i === -1) return [...prev, { productId, quantity: qty }];
      const next = [...prev];
      next[i] = { ...next[i], quantity: next[i].quantity + qty };
      return next;
    });

  const _remove = (productId: number) =>
    setItems((prev) => prev.filter((p) => p.productId !== productId));

  const _setQty = (productId: number, qty: number) =>
    setItems((prev) => prev.map((p) => (p.productId === productId ? { ...p, quantity: qty } : p)));

  const clear = () => setItems([]);

  const value = useMemo<CartCtxValue>(
    () => ({ items, add: _add, remove: _remove, setQty: _setQty, clear }),
    [items]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
