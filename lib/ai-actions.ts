"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";
import * as cheerio from "cheerio";

// Initialize custom Google provider
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function generateResourceSummary(resourceId: string, pathId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");

    const resource = await db.resource.findUnique({
        where: { id: resourceId }
    });

    if (!resource) throw new Error("Resource not found");

    // Fetch content (basic scraping) or use direct content
    let content = "";

    if (resource.content) {
        content = resource.content;
    } else if (resource.url) {
        // Check if it's a YouTube URL
        const isYouTube = resource.url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/);

        if (isYouTube) {
            let videoDescription = "";
            try {
                const res = await fetch(resource.url);
                const html = await res.text();
                const $ = cheerio.load(html);
                videoDescription = $('meta[name="description"]').attr('content') ||
                    $('meta[property="og:description"]').attr('content') ||
                    "";
            } catch (e) {
                console.error("Failed to fetch YouTube description", e);
            }

            content = `Video Title: ${resource.title}\nVideo URL: ${resource.url}\nVideo Description: ${videoDescription}\n\nPlease summarize this YouTube video based on its title, description, and generally available knowledge about this content.`;
        } else {
            try {
                const res = await fetch(resource.url);
                const html = await res.text();
                const $ = cheerio.load(html);

                // Remove scripts, styles, etc.
                $('script, style, noscript, svg, footer, header, nav').remove();
                content = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 10000); // Limit context
            } catch (error) {
                console.error("Error fetching URL:", error);
                content = `The user shared this link: ${resource.url}. Please summarize the likely content based on the URL or title '${resource.title}'.`;
            }
        }
    } else {
        throw new Error("Resource has no content to summarize");
    }

    const path = await db.learningPath.findUnique({
        where: { id: pathId }
    });

    const topic = path?.title || "this topic";

    // Enhanced Prompt Construction
    let systemRole = `You are an expert tutor specializing in ${topic}. Your goal is to provide a summary that maximizes learning retention.`;
    let userPrompt = "";

    // Common structure for all summaries to ensure consistency
    const formatInstructions = `
    Format your response in Markdown. Use the following structure:
    ## 🎯 Core Concept
    [A 1-sentence definition of the main idea]

    ## 🔑 Key Takeaways
    - [Key point 1]
    - [Key point 2]
    - [Key point 3]

    ## 💡 Practical Application
    [One specific example of how to apply this knowledge]
    `;

    switch (resource.type) {
        case 'code':
            userPrompt = `
            Analyze this code snippet from the perspective of a senior engineer code review.
            
            Code Snippet:
            \`\`\`
            ${content}
            \`\`\`
            
            Provide a summary that explains:
            1. The logic flow (how it works).
            2. Syntax highlights (unusual or important patterns).
            3. Best practices (efficiency, readability, security) or potential pitfalls.
            
            ${formatInstructions}
            `;
            break;

        case 'video':
            userPrompt = `
            Summarize this video resource. Focus on the visual or demonstrative aspects if inferred from the description.
            
            Video Details:
            ${content}
            
            Explain:
            1. The main problem or topic addressed.
            2. The solution or technique demonstrated.
            3. Why this specific video is valuable for learning ${topic}.

            ${formatInstructions}
            `;
            break;

        case 'article':
        case 'blog':
            userPrompt = `
            Synthesize the main arguments of this article.
            
            Article Content:
            ${content}
            
            Focus on:
            1. The author's main thesis.
            2. Supporting evidence or arguments.
            3. How this changes or reinforces understanding of ${topic}.

            ${formatInstructions}
            `;
            break;

        case 'tutorial':
            userPrompt = `
            Break down this tutorial into a high-level workflow.
            
            Tutorial Content:
            ${content}
            
            Focus on:
            1. The prerequisite knowledge needed.
            2. The step-by-step logical flow (not every minor click, but the major phases).
            3. The final outcome/artifact produced.

            ${formatInstructions}
            `;
            break;

        default:
            userPrompt = `
            Summarize this learning resource.
            
            Content:
            ${content}
            
            Distill the most important information for a student learning ${topic}.
            
            ${formatInstructions}
            `;
            break;
    }

    try {
        const { text } = await generateText({
            model: google("gemini-2.5-flash"),
            system: systemRole,
            prompt: userPrompt,
        });

        await db.resource.update({
            where: { id: resourceId },
            data: { summary: text }
        });

        revalidatePath(`/dashboard/paths/${pathId}`);
        return { success: true };
    } catch (error) {
        console.error("AI Error:", error);
        throw new Error(`Failed to generate summary: ${(error as Error).message}`);
    }
}

export async function generateQuiz(pathId: string, regenerate: boolean = false) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const path = await db.learningPath.findUnique({
        where: { id: pathId },
        include: {
            quiz: true,
            resources: true
        }
    });

    if (!path) throw new Error("Path not found");
    if (path.quiz && !regenerate) return { success: true };

    const context = path.resources.map((r: typeof path.resources[0]) =>
        `Resource Title: "${r.title}"\nSummary: ${r.summary || r.content || "No content"}`
    ).join("\n\n").slice(0, 20000);

    // Zod Schema for Structured Output
    const QuizSchema = z.object({
        questions: z.array(z.object({
            question: z.string().describe("The text of the question"),
            options: z.array(z.string()).length(4).describe("4 possible answers"),
            answer: z.number().min(0).max(3).describe("The index of the correct option (0-3)"),
            difficulty: z.enum(["easy", "medium", "hard"]).describe("The difficulty level"),
            sourceResourceTitle: z.string().describe("The title of the resource this question is based on")
        })).min(5).max(10)
    });

    try {
        const { object } = await generateObject({
            model: google("gemini-1.5-pro"), // Use Pro for better reasoning on complex tasks
            schema: QuizSchema,
            system: "You are an expert exam creator. Your goal is to create a challenging and fair multiple-choice quiz.",
            prompt: `
            Create a 10-question quiz based on the following learning path resources:
            
            "${context}"
            
            Guidelines:
            1. Questions should test understanding, not just rote memorization.
            2. Distractors (wrong answers) should be plausible.
            3. Cover a variety of resources if possible.
            4. VARY the difficulty.
            `,
        });

        await db.quiz.upsert({
            where: { pathId: path.id },
            update: { questions: object.questions },
            create: {
                pathId: path.id,
                questions: object.questions
            }
        });

        revalidatePath(`/dashboard/paths/${pathId}`);
        return { success: true };
    } catch (error) {
        console.error("Quiz Gen Error:", error);
        throw new Error("Failed to generate quiz. Please try again.");
    }
}

export async function generateFlashcards(pathId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const path = await db.learningPath.findUnique({
        where: { id: pathId },
        include: {
            flashcards: true,
            resources: true
        }
    });

    if (!path) throw new Error("Path not found");
    if (path.flashcards.length > 0) return { success: true };

    const context = path.resources.map((r: typeof path.resources[0]) =>
        `Title: ${r.title}\nSummary: ${r.summary || r.content || "No content"}`
    ).join("\n\n").slice(0, 20000);

    const FlashcardsSchema = z.object({
        flashcards: z.array(z.object({
            front: z.string().describe("The term, concept, or prompt on the front of the card"),
            back: z.string().describe("The definition, explanation, or answer on the back")
        })).min(10)
    });

    try {
        const { object } = await generateObject({
            model: google("gemini-1.5-pro"),
            schema: FlashcardsSchema,
            system: "You are an expert Spaced Repetition System (SRS) card creator.",
            prompt: `
            Create 15 high-quality flashcards for the following learning materials:
            
            "${context}"
            
            Rules for GOOD Flashcards:
            1. **Atomic**: One fact per card.
            2. **Specific**: Avoid vague prompts.
            3. **Brief**: The back should be answerable in < 5 seconds.
            
            Avoid "True/False" or "What is X?" formats if possible. Use "Concept -> Definition" or "Problem -> Solution" mappings.
            `,
        });

        await db.flashcard.createMany({
            data: object.flashcards.map((c) => ({
                front: c.front,
                back: c.back,
                pathId: path.id
            }))
        });

        revalidatePath(`/dashboard/paths/${pathId}`);
        return { success: true };
    } catch (error) {
        console.error("Flashcard Gen Error:", error);
        throw new Error("Failed to generate flashcards.");
    }
}

export async function toggleFlashcardMastery(flashcardId: string, isMastered: boolean, pathId: string) {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    await db.flashcard.update({
        where: { id: flashcardId },
        data: { isMastered }
    });

    revalidatePath(`/dashboard/paths/${pathId}`);
    return { success: true };
}
