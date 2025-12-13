"use server";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function saveQuizAttempt(
    quizId: string,
    score: number,
    totalQuestions: number
) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    // Calculate pass status (e.g. > 70%)
    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= 70;

    try {
        await db.quizAttempt.create({
            data: {
                userId: user.id,
                quizId,
                score,
                totalQuestions,
                passed
            }
        });

        revalidatePath("/dashboard/paths/[pathId]");
        return { success: true };
    } catch (error) {
        console.error("Failed to save quiz attempt:", error);
        throw new Error("Failed to save attempt");
    }
}

export async function getQuizHistory(pathId: string) {
    const user = await checkUser();
    if (!user) return [];

    try {
        const quiz = await db.quiz.findUnique({
            where: { pathId },
            include: {
                attempts: {
                    where: { userId: user.id },
                    orderBy: { createdAt: "desc" },
                    take: 10 // Last 10 attempts
                }
            }
        });

        if (!quiz) return [];

        return quiz.attempts;
    } catch (error) {
        console.error("Failed to fetch quiz history:", error);
        return [];
    }
}
