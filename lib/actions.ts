"use server";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreatePathSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    difficulty: z.string().min(1, "Difficulty is required"),
});

const AddResourceSchema = z.object({
    pathId: z.string().uuid(),
    title: z.string().min(1, "Title is required").max(150),
    url: z.string().url("Invalid URL").optional().or(z.literal("")),
    content: z.string().optional(),
    type: z.string().min(1),
});

const UpdateProfileSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().optional(),
    bio: z.string().max(300, "Bio must be less than 300 characters").optional(),
    dailyGoal: z.coerce.number().min(1).max(1440).optional(),
});

export async function updateUserProfile(formData: FormData) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const rawData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        bio: formData.get("bio"),
        dailyGoal: formData.get("dailyGoal"),
    };

    const validated = UpdateProfileSchema.safeParse(rawData);

    if (!validated.success) {
        throw new Error(validated.error.issues[0].message);
    }

    await db.user.update({
        where: { id: user.id },
        data: {
            firstName: validated.data.firstName,
            lastName: validated.data.lastName || null,
            bio: validated.data.bio || null,
            dailyGoal: validated.data.dailyGoal || 30,
        }
    });

    revalidatePath("/profile");
    revalidatePath(`/profile/${user.id}`);
    revalidatePath("/settings");
}

export async function togglePrivacy(isPrivate: boolean) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.user.update({
        where: { id: user.id },
        data: { isPrivate }
    });

    revalidatePath("/profile");
    revalidatePath(`/profile/${user.id}`);
    revalidatePath("/settings");
}

export async function saveResourceNote(resourceId: string, content: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.resourceNote.create({
        data: {
            userId: user.id,
            resourceId,
            content
        }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/path/${resourceId}`); // Ensure specific path revalidates too if needed
}

export async function deleteResourceNote(noteId: string, pathId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.resourceNote.delete({
        where: { id: noteId, userId: user.id }
    });

    revalidatePath(`/dashboard/paths/${pathId}`, 'page');
}

export async function updateResourceNote(noteId: string, content: string, pathId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.resourceNote.update({
        where: { id: noteId, userId: user.id },
        data: { content }
    });

    revalidatePath(`/dashboard/paths/${pathId}`, 'page');
}

export async function getResourceNote(resourceId: string) {
    const user = await checkUser();
    if (!user) return null;

    const note = await db.resourceNote.findFirst({
        where: { userId: user.id, resourceId }
    });
    return note ? note.content : "";
}

export async function addGoal(data: { title: string; target: number; type: string; metric: string }) {
    const user = await checkUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    try {
        const goal = await db.goal.create({
            data: {
                userId: user.id,
                title: data.title,
                target: data.target,
                type: data.type,
                metric: data.metric,
            }
        });
        revalidatePath("/dashboard");
        return goal;
    } catch (error) {
        console.error("Failed to create goal", error);
        throw new Error("Failed to create goal");
    }
}

export async function exportUserData() {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const fullUserData = await db.user.findUnique({
        where: { id: user.id },
        include: {
            learningPaths: {
                include: {
                    resources: true,
                    flashcards: true,
                    quiz: true,
                }
            },
            quizAttempt: true,
            stars: true,
            following: true,
            followedBy: true,
        }
    });

    return JSON.stringify(fullUserData, null, 2);
}


export async function deleteAccount() {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    // Delete from Database
    // This will CASCADE delete all LearningPaths, Resources, Quizzes, Flashcards, generic-content, etc.
    await db.user.delete({
        where: { id: user.id }
    });

    // Note: This does not delete the user from Clerk.
    // In a production app, you would also use clerkClient.users.deleteUser(user.clerkId) here.
    // For now, removing from DB clears all their content from the Explore page as requested.
}


export async function createLearningPath(formData: FormData) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        difficulty: formData.get("difficulty"),
    };

    const validatedDAta = CreatePathSchema.safeParse(rawData);

    if (!validatedDAta.success) {
        throw new Error(validatedDAta.error.issues[0].message);
    }

    const { title, description, category, difficulty } = validatedDAta.data;

    await db.learningPath.create({
        data: {
            userId: user.id,
            title,
            description: description || "",
            category,
            difficulty,
        },
    });

    revalidatePath("/dashboard");
}

export async function deleteLearningPath(pathId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    // Ensure user owns the path
    const path = await db.learningPath.findUnique({
        where: { id: pathId }
    });

    if (!path || path.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    await db.learningPath.delete({
        where: {
            id: pathId,
        },
    });

    revalidatePath("/dashboard");
}

export async function addResource(formData: FormData) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const rawData = {
        pathId: formData.get("pathId") as string,
        title: formData.get("title") as string,
        url: (formData.get("url") as string) || undefined,
        content: (formData.get("content") as string) || undefined,
        type: formData.get("type") as string,
    };

    const validatedData = AddResourceSchema.safeParse(rawData);

    if (!validatedData.success) {
        throw new Error(validatedData.error.issues[0].message);
    }

    const { pathId, title, url, content, type } = validatedData.data;

    // Check for duplicates to prevent double-submission
    const existingResource = await db.resource.findFirst({
        where: {
            pathId,
            title,
            OR: [
                { url: url || undefined },
                { content: content || undefined }
            ]
        }
    });

    if (existingResource) {
        // Idempotent success: return as if created, but don't duplicate
        return;
    }

    await db.resource.create({
        data: {
            pathId,
            title,
            url: url || undefined,
            content: content || undefined,
            type,
        },
    });

    // Mark path as modified
    await db.learningPath.update({
        where: { id: pathId },
        data: { isModified: true }
    });

    revalidatePath(`/dashboard/paths/${pathId}`);
}

export async function deleteResource(resourceId: string, pathId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.resource.delete({
        where: { id: resourceId }
    });

    // Mark path as modified
    await db.learningPath.update({
        where: { id: pathId },
        data: { isModified: true }
    });

    revalidatePath(`/dashboard/paths/${pathId}`);
}

export async function toggleResourceCompletion(resourceId: string, isCompleted: boolean, pathId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    // Update Resource
    await db.resource.update({
        where: { id: resourceId },
        data: { isCompleted }
    });

    // Handle Streak Logic (Only when completing)
    if (isCompleted) {
        const dbUser = await db.user.findUnique({ where: { id: user.id } });

        if (dbUser) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let lastDate = dbUser.lastStudyDate ? new Date(dbUser.lastStudyDate) : null;
            if (lastDate) lastDate.setHours(0, 0, 0, 0);

            let newStreak = dbUser.streakCount;

            if (!lastDate) {
                // First time ever
                newStreak = 1;
            } else if (lastDate.getTime() === today.getTime()) {
                // Already studied today, keep streak
            } else if (lastDate.getTime() === today.getTime() - 86400000) {
                // Studied yesterday, increment
                newStreak += 1;
            } else {
                // Missed a day (or more), reset
                newStreak = 1;
            }

            await db.user.update({
                where: { id: user.id },
                data: {
                    lastStudyDate: new Date(),
                    streakCount: newStreak
                }
            });
        }
    }

    // Handle Goal Progress (Only when completing)
    if (isCompleted) {
        // Find active RESOURCE goals
        const activeGoals = await db.goal.findMany({
            where: {
                userId: user.id,
                metric: "RESOURCES",
                isCompleted: false
            }
        });

        for (const goal of activeGoals) {
            const newProgress = goal.progress + 1;
            await db.goal.update({
                where: { id: goal.id },
                data: {
                    progress: newProgress,
                    isCompleted: newProgress >= goal.target
                }
            });
        }
    }

    revalidatePath(`/dashboard/paths/${pathId}`);
    revalidatePath("/dashboard"); // Update header stats
}

export async function clearResourceSummary(resourceId: string, pathId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.resource.update({
        where: { id: resourceId },
        data: { summary: null }
    });

    revalidatePath(`/dashboard/paths/${pathId}`);
}

export async function updateLearningPath(pathId: string, data: { title?: string; description?: string; category?: string; difficulty?: string; isPublic?: boolean }) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const path = await db.learningPath.findUnique({
        where: { id: pathId }
    });

    if (!path || path.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    if (data.isPublic === true) {
        // Enforce modification requirement for clones
        if (path.clonedFromId && !path.isModified) {
            return { error: "You must modify this cloned path (edit details or add resources) before making it public." };
        }
    }

    // If updating anything other than just toggling public status, mark as modified
    let isModified = path.isModified;
    if (data.title || data.description || data.category || data.difficulty) {
        isModified = true;
    }

    await db.learningPath.update({
        where: { id: pathId },
        data: {
            ...data,
            isModified,
        },
    });

    revalidatePath(`/dashboard/paths/${pathId}`);
    revalidatePath("/dashboard");
}

export async function cloneLearningPath(pathId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const originalPath = await db.learningPath.findUnique({
        where: { id: pathId },
        include: { resources: true }
    });

    if (!originalPath) throw new Error("Path not found");
    if (!originalPath.isPublic && originalPath.userId !== user.id) throw new Error("Unauthorized");

    // Check if user already owns this path or has cloned it
    const existingClone = await db.learningPath.findFirst({
        where: {
            userId: user.id,
            OR: [
                { id: pathId }, // Direct owner
                { clonedFromId: pathId } // Already cloned
            ]
        }
    });

    if (existingClone) {
        throw new Error("You already have this path in your dashboard");
    }

    // Create new path
    const newPath = await db.learningPath.create({
        data: {
            userId: user.id,
            title: `Copy of ${originalPath.title}`,
            description: originalPath.description,
            category: originalPath.category,
            difficulty: originalPath.difficulty,
            isPublic: false, // Clones are private by default
            clonedFromId: originalPath.id,
            isModified: false, // Clones start as unmodified
        }
    });

    // Copy resources
    if (originalPath.resources.length > 0) {
        await db.resource.createMany({
            data: originalPath.resources.map((res: typeof originalPath.resources[0]) => ({
                pathId: newPath.id,
                title: res.title,
                url: res.url,
                content: res.content,
                type: res.type,
                summary: res.summary,
                isCompleted: false, // Reset completion
            }))
        });
    }

    revalidatePath("/dashboard");
    return newPath;
}

export async function togglePathStar(pathId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const existingStar = await db.pathStar.findUnique({
        where: {
            userId_pathId: {
                userId: user.id,
                pathId
            }
        }
    });

    // Fetch path info for revalidation and notification
    const path = await db.learningPath.findUnique({ where: { id: pathId }, select: { userId: true, title: true } });

    if (existingStar) {
        await db.pathStar.delete({
            where: { id: existingStar.id }
        });
    } else {
        await db.pathStar.create({
            data: {
                userId: user.id,
                pathId
            }
        });

        // Notify Path Owner
        if (path && path.userId !== user.id) {
            await db.notification.create({
                data: {
                    userId: path.userId,
                    type: "STAR",
                    message: `${user.firstName || "Someone"} starred your path "${path.title}".`,
                    actorId: user.id,
                    pathId: pathId,
                    isRead: false
                }
            });
        }
    }

    revalidatePath("/explore");
    revalidatePath("/dashboard");
    revalidatePath(`/path/${pathId}`);
    if (path) {
        revalidatePath(`/profile/${path.userId}`);
    }
}

export async function getPathDetails(pathId: string) {
    const user = await checkUser();

    // Fetch path with resources and star count
    // We allow fetching even if not logged in? Ideally yes for public paths, but checkUser ensures auth.
    // If we want public access, we might need a separate check, but for now enforcing auth is safe.

    const path = await db.learningPath.findUnique({
        where: { id: pathId },
        include: {
            user: {
                select: { firstName: true, lastName: true, id: true }
            },
            resources: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    url: true,
                    content: true,
                    summary: true,
                    isCompleted: true,
                    notes: user ? {
                        where: { userId: user.id },
                        select: { id: true, content: true },
                        orderBy: { createdAt: 'desc' }
                    } : false
                }
            },
            _count: {
                select: { stars: true, resources: true }
            },
            stars: user ? {
                where: { userId: user.id },
                select: { id: true }
            } : false
        }
    });

    if (!path) throw new Error("Path not found");
    if (!path.isPublic && path.userId !== user?.id) throw new Error("Unauthorized");

    return {
        ...path,
        isStarred: user ? path.stars.length > 0 : false
    };
}

export async function toggleFollow(targetUserId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");
    if (user.id === targetUserId) throw new Error("Cannot follow yourself");

    const existingFollow = await db.follows.findUnique({
        where: {
            followerId_followingId: {
                followerId: user.id,
                followingId: targetUserId
            }
        }
    });

    if (existingFollow) {
        // Unfollow
        await db.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: user.id,
                    followingId: targetUserId
                }
            }
        });
        revalidatePath(`/profile/${targetUserId}`);
        return false;
    } else {
        // Check if target user is private
        const targetUser = await db.user.findUnique({
            where: { id: targetUserId },
            select: { isPrivate: true, firstName: true }
        });

        if (!targetUser) throw new Error("User not found");

        const isAccepted = !targetUser.isPrivate; // Auto-accept if public, else pending

        await db.follows.create({
            data: {
                followerId: user.id,
                followingId: targetUserId,
                isAccepted
            }
        });

        // Create Notification
        await db.notification.create({
            data: {
                userId: targetUserId,
                type: isAccepted ? "FOLLOW" : "REQUEST_FOLLOW",
                message: isAccepted
                    ? `${user.firstName || "Someone"} followed you.`
                    : `${user.firstName || "Someone"} requested to follow you.`,
                actorId: user.id,
                isRead: false
            }
        });

        revalidatePath(`/profile/${targetUserId}`);
        return true;
    }
}

export async function acceptFollowRequest(followerId: string, notificationId?: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.follows.update({
        where: {
            followerId_followingId: {
                followerId: followerId,
                followingId: user.id
            }
        },
        data: { isAccepted: true }
    });

    // Notify the follower that request was accepted
    await db.notification.create({
        data: {
            userId: followerId,
            type: "FOLLOW_ACCEPTED",
            message: `${user.firstName || "Someone"} accepted your follow request.`,
            actorId: user.id,
            isRead: false
        }
    });

    // Update the notification to "ACCEPTED" state instead of deleting
    if (notificationId) {
        await db.notification.update({
            where: { id: notificationId },
            data: {
                type: "REQUEST_ACCEPTED",
                message: `You accepted the follow request.`,
                isRead: true
            }
        });
    }

    revalidatePath("/dashboard");
    revalidatePath(`/profile/${user.id}`);
}

export async function declineFollowRequest(followerId: string, notificationId?: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.follows.delete({
        where: {
            followerId_followingId: {
                followerId: followerId,
                followingId: user.id
            }
        }
    });

    // Cleanup the "Request" notification
    if (notificationId) {
        await db.notification.delete({
            where: { id: notificationId }
        });
    }

    revalidatePath("/dashboard");
}



export async function getNotifications() {
    const user = await checkUser();
    if (!user) return [];

    const notifications = await db.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20
    });

    // Enhance notifications with "isFollowing" status for the actor
    const actorIds = Array.from(new Set(notifications.map(n => n.actorId).filter(Boolean))) as string[];

    const follows = actorIds.length > 0 ? await db.follows.findMany({
        where: {
            followerId: user.id,
            followingId: { in: actorIds },
            isAccepted: true
        }
    }) : [];

    const followingActorIds = new Set(follows.map(f => f.followingId));

    const enhancedNotifications = notifications.map((n: any) => ({
        ...n,
        isFollowingActor: n.actorId ? followingActorIds.has(n.actorId) : false
    }));

    return enhancedNotifications;
}

export async function markNotificationRead(id: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.notification.update({
        where: { id, userId: user.id },
        data: { isRead: true }
    });

    revalidatePath("/dashboard");
}

export async function markAllNotificationsRead() {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true }
    });

    revalidatePath("/dashboard");
}

export async function deleteNotification(id: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.notification.delete({
        where: { id, userId: user.id }
    });

    revalidatePath("/dashboard");
}

export async function deleteAllNotifications() {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.notification.deleteMany({
        where: { userId: user.id }
    });

    revalidatePath("/dashboard");
}

export async function getUserProfile(userId: string) {
    const currentUser = await checkUser();

    // userId could be internal ID (CUID) or Clerk ID
    const user = await db.user.findFirst({
        where: {
            OR: [
                { id: userId },
                { clerkId: userId }
            ]
        },
        include: {
            _count: {
                select: {
                    following: true,
                    followedBy: true,
                    learningPaths: { where: { isPublic: true } }
                }
            },
            followedBy: currentUser ? {
                where: { followerId: currentUser.id }
            } : false
        }
    });

    if (!user) return null;

    // Privacy Check
    // If user is private AND viewer is not the user AND viewer is not an ACCEPTED follower => Return specific "private" state
    let isFollowing = false;
    let hasRequested = false;

    if (currentUser) {
        const followRecord = await db.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUser.id,
                    followingId: user.id
                }
            }
        });

        if (followRecord) {
            isFollowing = followRecord.isAccepted;
            hasRequested = !followRecord.isAccepted;
        }
    }

    if (user.isPrivate && (!currentUser || currentUser.id !== user.id) && !isFollowing) {
        // Return limited profile for private users
        return {
            user: {
                ...user,
                bio: null, // Hide bio if preferred, or keep it
            },
            stats: {
                followers: user._count.followedBy,
                following: user._count.following,
                paths: user._count.learningPaths,
                stars: 0
            },
            paths: [],
            isFollowing,
            hasRequested,
            isPrivate: true
        };
    }


    // Use the resolved internal ID for querying paths
    const publicPaths = await db.learningPath.findMany({
        where: { userId: user.id, isPublic: true },
        include: {
            _count: { select: { resources: true, stars: true } },
            user: { select: { firstName: true, lastName: true } },
            stars: currentUser ? {
                where: { userId: currentUser.id },
                select: { id: true }
            } : false
        },
        orderBy: { createdAt: "desc" }
    });

    const totalStars = publicPaths.reduce((acc: number, path: any) => acc + (path._count.stars || 0), 0);

    return {
        user,
        stats: {
            followers: user._count.followedBy,
            following: user._count.following,
            paths: user._count.learningPaths,
            stars: totalStars
        },
        paths: publicPaths.map((path: any) => ({
            ...path,
            isStarred: currentUser ? path.stars.length > 0 : false
        })),
        isFollowing,
        hasRequested,
        isPrivate: false
    };
}

export async function getFollowers(userId: string) {
    const followers = await db.follows.findMany({
        where: { followingId: userId },
        include: {
            follower: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    // avatarUrl: true // If we had this
                }
            }
        }
    });
    return followers.map((f: any) => f.follower);
}

export async function getFollowing(userId: string) {
    const following = await db.follows.findMany({
        where: { followerId: userId },
        include: {
            following: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                }
            }
        }
    });
    return following.map((f: any) => f.following);
}
