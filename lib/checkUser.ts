import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const checkUser = async () => {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    const loggedInUser = await db.user.findUnique({
        where: {
            clerkId: user.id,
        },
    });

    if (loggedInUser) {
        return loggedInUser;
    }

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

    try {
        const newUser = await db.user.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
        return newUser;
    } catch (error: any) {
        // If there's a unique constraint violation on clerkId, it means the user was created concurrently.
        // We can just fetch the user in that case.
        if (error.code === 'P2002') {
            if (error.meta?.target?.includes('clerkId')) {
                const existingUser = await db.user.findUnique({
                    where: {
                        clerkId: user.id,
                    },
                });
                return existingUser;
            }

            if (error.meta?.target?.includes('email')) {
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
        }
        throw error;
    }

};
