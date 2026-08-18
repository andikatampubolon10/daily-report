import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database...");

  // Hapus data lama jika perlu (opsional)
  // await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // Buat Manager
  const manager = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      name: "Admin Manager",
      email: "admin@demo.com",
      password: passwordHash,
      role: "MANAGER",
    },
  });
  console.log(`Created manager: ${manager.email}`);

  // Buat Karyawan 1
  const employee1 = await prisma.user.upsert({
    where: { email: "user@demo.com" },
    update: {},
    create: {
      name: "Karyawan Satu",
      email: "user@demo.com",
      password: passwordHash,
      role: "EMPLOYEE",
    },
  });
  console.log(`Created employee 1: ${employee1.email}`);

  // Buat Karyawan 2
  const employee2 = await prisma.user.upsert({
    where: { email: "user2@demo.com" },
    update: {},
    create: {
      name: "Karyawan Dua",
      email: "user2@demo.com",
      password: passwordHash,
      role: "EMPLOYEE",
    },
  });
  console.log(`Created employee 2: ${employee2.email}`);

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
