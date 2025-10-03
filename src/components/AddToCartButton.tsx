"use client";
import { useCart } from "@/components/CartProvider";


export function AddToCartButton({ productId }: { productId: number }) {
    const { add } = useCart();
    return <button className="btn" onClick={() => add(productId, 1)}>Add to cart</button>;
}