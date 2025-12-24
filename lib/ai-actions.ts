"use server";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";
// import { google } from "@ai-sdk/google"; // Uncomment when ready to use real AI
// import { generateText } from "ai";

export async function getRecommendations() {
    const user = await checkUser();
    if (!user) return [];

    // 1. Analyze Quiz Performance (Score < 70%)
    const weakAreas = await db.quizAttempt.findMany({
        where: {
            userId: user.id,
            score: { lt: 70 } // Logic: totalQuestions is needed to calc %, but usually score is raw. 
            // My schema says score is Int. Usually store raw score? 
            // Let's assume passed=false is enough signal.
            // passed: false 
        },
        include: {
            quiz: {
                include: { path: { select: { title: true, category: true, id: true } } }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 3
    });

    // 2. Mock AI Logic (or Real if configured)
    const recommendations = weakAreas.map(attempt => ({
        id: `rec-${attempt.id}`,
        type: "REVIEW",
        title: `Review: ${attempt.quiz.path.title}`,
        description: `You scored low on this quiz. Review the materials to improve your mastery.`,
        pathId: attempt.quiz.path.id,
        actionLabel: "Retake Quiz"
    }));

    // 3. Suggest popular paths if no weak areas
    if (recommendations.length === 0) {
        const popular = await db.learningPath.findMany({
            where: { isPublic: true, userId: { not: user.id } },
            orderBy: { stars: { _count: 'desc' } },
            take: 2,
            select: { id: true, title: true, description: true }
        });

        popular.forEach(p => {
            recommendations.push({
                id: `rec-pop-${p.id}`,
                type: "EXPLORE",
                title: `Try: ${p.title}`,
                description: "This popular path matches your interests.",
                pathId: p.id,
                actionLabel: "View Path"
            });
        });
    }

    return recommendations;
}

export async function generateResourceSummary(resourceId: string, pathId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const resource = await db.resource.findUnique({ where: { id: resourceId } });
    if (!resource || resource.pathId !== pathId) throw new Error("Resource not found");

    // Mock AI Summary (Replace with Google AI usage)
    // const prompt = `Summarize this content: ${resource.content || resource.url}`;
    // const summary = await generateText(prompt); (pseudo-code)

    const summary = `**AI Summary:**\n\nThis is a generated summary for ${resource.title}. \n\n*   Key concept 1\n*   Key concept 2\n*   Actionable takeaway\n\n(AI integration placeholder)`;

    await db.resource.update({
        where: { id: resourceId },
        data: { summary }
    });

    revalidatePath(`/dashboard/paths/${pathId}`);
}

export async function generateQuiz(pathId: string, regenerate: boolean = false) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    // Check existing
    const existing = await db.quiz.findFirst({
        where: { pathId }
    });

    if (existing && !regenerate) return;

    if (existing && regenerate) {
        await db.quiz.delete({ where: { id: existing.id } });
    }

    // Mock Questions
    const questions = [
        {
            question: "What is the primary goal of this learning path?",
            options: ["Mastery", "Confusion", "Sleep", "None"],
            answer: 0,
            difficulty: "easy"
        },
        {
            question: "Which concept is most critical?",
            options: ["Concept A", "Concept B", "Concept C", "All of the above"],
            answer: 3,
            difficulty: "medium"
        },
        {
            question: "True or False: Design is crucial.",
            options: ["True", "False"],
            answer: 0,
            difficulty: "easy"
        }
    ];

    await db.quiz.create({
        data: {
            pathId,
            questions: questions
        }
    });

    revalidatePath(`/dashboard/paths/${pathId}`);
}
