import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const checkUser = async () => {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    try {
        const loggedInUser = await db.user.upsert({
            where: {
                clerkId: user.id,
            },
            create: {
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            update: {
                email: user.emailAddresses[0].emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });

        return loggedInUser;
    } catch (error: any) {
        // If there's a unique constraint violation on email, it means the user exists with a different clerkId (or race condition on email).
        // We find the user by email and assume ownership (updating the clerkId).
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            const existingUser = await db.user.findUnique({
                where: {
                    email: user.emailAddresses[0].emailAddress,
                }
            });

            if (existingUser) {
                const updatedUser = await db.user.update({
                    where: { id: existingUser.id },
                    data: {
                        clerkId: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName
                    }
                });
                return updatedUser;
            }
        }
        throw error;
    }

};
