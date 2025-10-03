import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const toCents = (usd: number) => Math.round(usd * 100);
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const IMG_BASE = "/images/assets"; // matches public/images/assets/images
const IMG = (f: string) => `${IMG_BASE}/${f}`;

const rows = [
  { name: "Captain", color: "Black",      price: 199, image: IMG("captain-black-matte.png"), desc: "Comfortable, versatile and durable cap-toe boot handcrafted..." },
  { name: "Captain", color: "Black",      price: 199, image: IMG("captain-black.png"),       desc: "Comfortable, versatile and durable cap-toe boot handcrafted..." },
  { name: "Scout",   color: "Olive",      price: 199, image: IMG("scout-olive.png"),         desc: "The chukka for a new generation..." },
  { name: "Captain", color: "Terracotta", price: 199, image: IMG("captain-terracotta.png"),  desc: "Comfortable, versatile and durable cap-toe boot..." },
  { name: "Captain", color: "Brandy",     price: 199, image: IMG("captain-brandy.png"),      desc: "Comfortable, versatile and durable cap-toe boot..." },
  { name: "Chelsea", color: "Black",      price: 199, image: IMG("chelsea-black-suede.png"), desc: "A classic Chelsea boot for the modern man..." },
  { name: "Chelsea", color: "Brown",      price: 199, image: IMG("captain-brown.png"),       desc: "A classic Chelsea boot for the modern man..." },
  { name: "Chelsea", color: "Honey",      price: 199, image: IMG("chelsea-honey.png"),       desc: "A classic Chelsea boot for the modern man..." },
  { name: "Chelsea", color: "Olive",      price: 199, image: IMG("chelsea-olive.png"),       desc: "A classic Chelsea boot for the modern man..." },
  { name: "Scout",   color: "Black",      price: 199, image: IMG("scout-black.png"),         desc: "The chukka for a new generation..." },
  { name: "Scout",   color: "Blue",       price: 199, image: IMG("scout-blue.png"),          desc: "The chukka for a new generation..." },
  { name: "Scout",   color: "Brown",      price: 199, image: IMG("scout-brown.png"),         desc: "The chukka for a new generation..." },
  { name: "Scout",   color: "Caramel",    price: 199, image: IMG("scout-caramel.png"),       desc: "The chukka for a new generation..." },
  { name: "Scout",   color: "Cognac",     price: 199, image: IMG("scout-cognac.png"),        desc: "The chukka for a new generation..." },
  { name: "Captain", color: "Brown",      price: 199, image: IMG("captain-brown.png"),       desc: "Comfortable, versatile and durable cap-toe boot..." },
];

async function main() {
  console.log("Seeding into:", process.env.DIRECT_URL ?? process.env.DATABASE_URL);

  // hard reset to avoid stale rows
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE;`);

  // build records with unique slugs
  const data = rows.map((r, i) => ({
    slug: [slugify(r.name), slugify(r.color ?? ""), String(i + 1)].filter(Boolean).join("-"),
    name: r.name,
    color: r.color ?? null,
    priceCents: toCents(r.price),
    imageUrl: r.image,
    description: r.desc,
  }));

  await prisma.product.createMany({ data });
  const count = await prisma.product.count();
  console.log("Inserted products:", count);
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error("Seed failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
