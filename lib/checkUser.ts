import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const checkUser = cache(async () => {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    try {
        const existingUser = await db.user.findUnique({
            where: { clerkId: user.id }
        });

        if (existingUser) {
            // Check if updates are needed
            if (
                existingUser.email !== user.emailAddresses[0].emailAddress ||
                existingUser.firstName !== user.firstName ||
                existingUser.lastName !== user.lastName
            ) {
                return await db.user.update({
                    where: { id: existingUser.id },
                    data: {
                        email: user.emailAddresses[0].emailAddress,
                        firstName: user.firstName,
                        lastName: user.lastName,
                    },
                });
            }
            return existingUser;
        }

        // Create if not exists
        return await db.user.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    } catch (error: any) {
        // Handle race conditions or unique constraint violations on email
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            const existingUserByEmail = await db.user.findUnique({
                where: { email: user.emailAddresses[0].emailAddress }
            });

            if (existingUserByEmail) {
                return await db.user.update({
                    where: { id: existingUserByEmail.id },
                    data: {
                        clerkId: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName
                    }
                });
            }
        }
        throw error;
    }
});
