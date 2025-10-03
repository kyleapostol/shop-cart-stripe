// src/app/checkout/page.tsx
import CheckoutClient from "@/components/CheckoutClient";

export const dynamic = "force-dynamic"; // optional, handy in dev

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <CheckoutClient />
    </main>
  );
}
