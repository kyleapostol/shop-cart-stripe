import { prisma } from "../../lib/db";
import { FiPackage } from "react-icons/fi";


export const dynamic = "force-dynamic";


export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { items: true },
        take: 20,
    });
    return (
        <div>
            <h1 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                <FiPackage className="h-6 w-6" />
                Recent Orders
            </h1>
            {!orders.length && <p>You have no orders yet.</p>}
            {orders.map(o => (
                <div key={o.id} className="card" style={{ marginBottom: 12 }}>
                    <div><strong>{o.status.toUpperCase()}</strong> — ${(o.amountCents / 100).toFixed(2)} — {new Date(o.createdAt).toLocaleString()}</div>
                    <div>Stripe: {o.stripeId}</div>
                    <div>Email: {o.email}</div>
                    <ul>
                        {o.items.map(i => (
                            <li key={i.id}>{i.quantity} × {i.productId} @ ${(i.unitPriceCents / 100).toFixed(2)}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}