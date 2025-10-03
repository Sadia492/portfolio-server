// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@portfolio.com" },
    update: {},
    create: {
      name: "Portfolio Owner",
      email: "admin@portfolio.com",
      password: hashedPassword,
      role: Role.OWNER,
    },
  });

  console.log("Admin user created:", admin.email);
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
