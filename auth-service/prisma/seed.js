const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding users...");

  const hashedPassword = await bcrypt.hash("Admin@123", 12);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: await bcrypt.hash("User@123", 12),
      name: "Test User",
      role: "USER",
    },
  });

  console.log("✅ Seed users thành công!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());