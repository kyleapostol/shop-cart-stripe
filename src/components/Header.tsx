import Link from "next/link";
import { CartIndicator } from "@/components/CartIndicator";
// import { FiPackage } from "react-icons/fi";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/" className="font-extrabold">SoleX</Link>

        <nav className="flex items-center gap-5">
          <CartIndicator />
        </nav>
      </div>
    </header>
  );
}
