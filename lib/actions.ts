"use server";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function createLearningPath(formData: FormData) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const difficulty = formData.get("difficulty") as string;

    if (!title) {
        throw new Error("Title is required");
    }

    await db.learningPath.create({
        data: {
            userId: user.id,
            title,
            description,
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

    const pathId = formData.get("pathId") as string;
    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    const content = formData.get("content") as string;
    const type = formData.get("type") as string;

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
