import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminHash = await bcrypt.hash("Admin@123!", 12);
  const userHash  = await bcrypt.hash("User@123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@enterprise.local" },
    update: {},
    create: {
      email:        "admin@enterprise.local",
      passwordHash: adminHash,
      firstName:    "System",
      lastName:     "Admin",
      role:         "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "jane.doe@enterprise.local" },
    update: {},
    create: {
      email:        "jane.doe@enterprise.local",
      passwordHash: userHash,
      firstName:    "Jane",
      lastName:     "Doe",
      role:         "MANAGER",
    },
  });

  await prisma.user.upsert({
    where: { email: "john.smith@enterprise.local" },
    update: {},
    create: {
      email:        "john.smith@enterprise.local",
      passwordHash: userHash,
      firstName:    "John",
      lastName:     "Smith",
      role:         "USER",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
