import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";


export const metadata: Metadata = {
  title: "SoleX",
  description: "E-commerce Demo",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <header className="p-4 border-b border-gray-200">
          <div className="max-w-[1000px] mx-auto flex justify-between">
            <a href="/" className="font-semibold">SoleX</a>
            <a href="/orders">Orders</a>
          </div>
        </header>

        <CartProvider>
          <main className="max-w-[1000px] mx-auto my-6 p-4">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>

  );
}