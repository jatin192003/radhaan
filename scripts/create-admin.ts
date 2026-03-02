import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const adminEmail = "admin@radhaan.com";
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (existing) {
        // Ensure it's an admin
        if (existing.role !== "ADMIN") {
            await prisma.user.update({ where: { email: adminEmail }, data: { role: "ADMIN" } });
            console.log("✅ Promoted existing user to ADMIN:", adminEmail);
        } else {
            console.log("✅ Admin user already exists:", adminEmail);
        }
        return;
    }

    const hash = await bcrypt.hash("Chirag#8055", 12);
    await prisma.user.create({
        data: {
            name: "Radhaan Admin",
            email: adminEmail,
            passwordHash: hash,
            role: "ADMIN",
        },
    });
    console.log("✅ Admin user created!");
    console.log("   Email:", adminEmail);
    console.log("   Password: Admin@12345");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        pool.end();
    });
