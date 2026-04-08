const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Đang seed dữ liệu...");

  const mobile = await prisma.category.upsert({
    where: { slug: "mobile" },
    update: {},
    create: { name: "Điện thoại", slug: "mobile", description: "Smartphone các loại" },
  });

  const laptop = await prisma.category.upsert({
    where: { slug: "laptop" },
    update: {},
    create: { name: "Laptop", slug: "laptop", description: "Máy tính xách tay" },
  });

  await prisma.product.createMany({
    data: [
      {
        name: "iPhone 15 Pro",
        slug: "iphone-15-pro",
        price: 27990000,
        stock: 50,
        description: "iPhone 15 Pro - Titan tự nhiên",
        categoryId: mobile.id,
      },
      {
        name: "Samsung Galaxy S24",
        slug: "samsung-galaxy-s24",
        price: 22990000,
        stock: 30,
        description: "Samsung Galaxy S24 Ultra",
        categoryId: mobile.id,
      },
      {
        name: "MacBook Air M2",
        slug: "macbook-air-m2",
        price: 32990000,
        stock: 20,
        description: "MacBook Air chip M2 2023",
        categoryId: laptop.id,
      },
      {
        name: "Dell XPS 15",
        slug: "dell-xps-15",
        price: 35990000,
        stock: 15,
        description: "Dell XPS 15 OLED",
        categoryId: laptop.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed thành công!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());