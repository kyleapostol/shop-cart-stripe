import { prisma } from "../../lib/db";


export const dynamic = "force-dynamic";


export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { items: true },
        take: 20,
    });
    return (
        <div>
            <h1 style={{ fontSize: 24, marginBottom: 16 }}>Recent Orders (demo)</h1>
            {!orders.length && <p>No orders yet.</p>}
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