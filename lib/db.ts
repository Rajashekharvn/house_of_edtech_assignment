import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

declare global {
    var prisma_v14: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['error'],
    });
};

export const db = globalThis.prisma_v14 || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma_v14 = db;
