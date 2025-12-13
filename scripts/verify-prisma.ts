
import { PrismaClient } from '@prisma/client';

// Set env var before instantiation
process.env.DATABASE_URL = "postgresql://postgres.vzmyfsonkulflfvessko:R17%2C%4008%2Cj02@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Prisma Verification...");
    console.log("Using DATABASE_URL:", process.env.DATABASE_URL.substring(0, 20) + "...");

    // Check if Quiz model is defined
    // @ts-ignore
    if (!prisma.quiz) {
        console.error("❌ CRITICAL ERROR: 'quiz' model is missing from Prisma Client instance!");
        process.exit(1);
    }
    console.log("✅ 'quiz' model found in Prisma Client.");

    console.log("Attempting to query Quiz with 'attempts' relation...");

    try {
        // @ts-ignore
        const result = await prisma.quiz.findFirst({
            include: {
                attempts: {
                    take: 1
                }
            }
        });
        console.log("✅ Query executed successfully! Validation passed.");
    } catch (error: any) {
        console.error("❌ Query FAILED.");
        console.error("Error message:", error.message);

        if (error.message.includes("Unknown field `attempts`")) {
            console.error("\n!!! CONCLUSION: The Prisma Client is OUTDATED. It does not know about 'attempts'. !!!");
        } else {
            console.log("\nCONCLUSION: Validation passed (field 'attempts' is known), but query failed for other reasons: " + error.message);
        }
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
