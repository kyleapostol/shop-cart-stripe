"use client";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
export function CartLink() {
    const { items } = useCart();
    const count = items.reduce((n, i) => n + i.quantity, 0);
    return <Link href="/cart">Cart ({count})</Link>;
}