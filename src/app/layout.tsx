import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <CartProvider>
          <Header />
          <main className="mx-auto max-w-5xl p-4">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
