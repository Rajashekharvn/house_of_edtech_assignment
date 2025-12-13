"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
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

    let prompt = "";

    switch (resource.type) {
        case 'code':
            prompt = `
            You are an expert tutor in ${topic}.
            
            Your task is to explain the following code snippet which I added to my learning path.
            Provide a concise explanation (3 key bullet points) covering:
            1. What the code does (logic flow).
            2. Key concepts and syntax used.
            3. Best practices or common pitfalls related to this code.
            
            Code Snippet:
            ${content}
            
            Explanation:`;
            break;

        case 'text':
            prompt = `
            You are an expert tutor in ${topic}.
            
            Your task is to clean up and structure the following notes I took.
            Do NOT add external information or topics not mentioned in the notes.
            Provide a concise summary (3 key bullet points) that:
            1. Organizes the provided text.
            2. Fixes any clarity or grammar issues.
            3. Highlights the core message of the notes.
            
            My Notes:
            ${content}
            
            Refined Notes:`;
            break;

        case 'video':
            prompt = `
            You are an expert tutor in ${topic}.
            
            Your task is to summarize the following YouTube video resource I added to my learning path.
            Based on the title and description, provide a concise summary (3 key bullet points) covering:
            1. The core educational value/topic of the video.
            2. Key concepts or techniques explained.
            3. Actionable steps or practical takeaways for mastering ${topic}.
            
            Video Details:
            ${content}
            
            Summary:`;
            break;

        case 'pdf':
            prompt = `
            You are an expert tutor in ${topic}.
            
            Your task is to summarize this PDF document I added to my learning path.
            Provide a concise summary (3 key bullet points) covering:
            1. The main topics and structure of the document.
            2. Key information, data, or insights presented.
            3. How this PDF contributes to mastering ${topic}.
            
            PDF Resource:
            ${content}
            
            Summary:`;
            break;

        case 'book':
            prompt = `
            You are an expert tutor in ${topic}.
            
            Your task is to summarize this book/e-book resource I added to my learning path.
            Provide a concise summary (3 key bullet points) covering:
            1. The book's central themes and key chapters.
            2. Important concepts, frameworks, or methodologies presented.
            3. How reading this book will help master ${topic}.
            
            Book Details:
            ${content}
            
            Summary:`;
            break;

        case 'course':
            prompt = `
            You are an expert tutor in ${topic}.
            
            Your task is to summarize this online course I added to my learning path.
            Provide a concise summary (3 key bullet points) covering:
            1. The course curriculum and learning objectives.
            2. Key skills and knowledge areas covered.
            3. Expected outcomes and how it relates to mastering ${topic}.
            
            Course Details:
            ${content}
            
            Summary:`;
            break;

        case 'podcast':
            prompt = `
            You are an expert tutor in ${topic}.
            
            Your task is to summarize this podcast episode I added to my learning path.
            Provide a concise summary (3 key bullet points) covering:
            1. The main discussion topics and guest insights (if any).
            2. Key takeaways and expert opinions shared.
            3. How this podcast episode enhances understanding of ${topic}.
            
            Podcast Details:
            ${content}
            
            Summary:`;
            break;

        case 'tutorial':
            prompt = `
            You are an expert tutor in ${topic}.
            
            Your task is to summarize this tutorial I added to my learning path.
            Provide a concise summary (3 key bullet points) covering:
            1. The step-by-step process or workflow taught.
            2. Key techniques, tools, or commands demonstrated.
            3. Practical applications and how to apply this to ${topic}.
            
            Tutorial Content:
            ${content}
            
            Summary:`;
            break;

        case 'documentation':
            prompt = `
            You are an expert tutor in ${topic}.
            
            Your task is to summarize this documentation I added to my learning path.
            Provide a concise summary (3 key bullet points) covering:
            1. The main features, APIs, or concepts documented.
            2. Important usage patterns, parameters, or configurations.
            3. How this documentation supports mastering ${topic}.
            
            Documentation:
            ${content}
            
            Summary:`;
            break;

        case 'exercise':
            prompt = `
            You are an expert tutor in ${topic}.
            
            Your task is to analyze this exercise/practice problem I added to my learning path.
            Provide a concise summary (3 key bullet points) covering:
            1. The problem statement and what skills it tests.
            2. Key concepts or techniques needed to solve it.
            3. Learning objectives and how it reinforces ${topic}.
            
            Exercise:
            ${content}
            
            Analysis:`;
            break;

        case 'article':
        default:
            prompt = `
            You are an expert tutor in ${topic}.
            
            Your task is to summarize the following content from a resource I added to my learning path.
            Provide a concise summary (3 key bullet points) covering:
            1. The main argument or thesis of the content.
            2. Key facts, evidence, or concepts presented.
            3. The relevance and application to mastering ${topic}.
            
            Resource Content:
            ${content}
            
            Summary:`;
            break;
    }

    try {
        const { text } = await generateText({
            model: google("gemini-2.5-flash"),
            prompt: prompt,
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

    // If quiz exists and we are NOT regenerating, just return success
    if (path.quiz && !regenerate) return { success: true };

    // Aggregate context from all resources with titles
    const context = path.resources.map((r: typeof path.resources[0]) =>
        `Resource Title: "${r.title}"\nSummary: ${r.summary || r.content || "No content"}`
    ).join("\n\n").slice(0, 15000); // Limit context size

    const prompt = `
    You are an expert teacher. Create a comprehensive 10-question multiple choice quiz based on the following learning path resources:
    
    "${context}"
    
    For each question:
    1. Assign a difficulty level: "easy", "medium", or "hard"
    2. Track which resource the question is based on (use the exact resource title)
    3. Ensure questions cover different resources when possible
    4. Make these questions DIFFERENT from any standard questions if possible, to vary the experience.
    
    The output must be a valid JSON array of objects with this structure:
    [
        {
            "question": "Question text here",
            "options": ["A", "B", "C", "D"],
            "answer": 0, // index of correct option (0-3)
            "difficulty": "easy" | "medium" | "hard",
            "sourceResourceTitle": "Exact resource title this question is based on"
        }
    ]
    Do not wrap in markdown code blocks. Just raw JSON.
    `;

    try {
        const { text } = await generateText({
            model: google("gemini-2.5-flash"),
            prompt: prompt,
        });

        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const questions = JSON.parse(jsonStr);

        // Upsert the quiz (Create if new, Update if exists)
        await db.quiz.upsert({
            where: { pathId: path.id },
            update: { questions: questions },
            create: {
                pathId: path.id,
                questions: questions
            }
        });

        revalidatePath(`/dashboard/paths/${pathId}`);
        return { success: true };
    } catch (error) {
        console.error("Quiz Gen Error:", error);
        throw new Error(`Failed to generate quiz: ${(error as Error).message}`);
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
    // If flashcards exist, return success
    if (path.flashcards.length > 0) return { success: true };

    const context = path.resources.map((r: typeof path.resources[0]) =>
        `Title: ${r.title}\nSummary: ${r.summary || r.content || "No content"}`
    ).join("\n\n").slice(0, 15000);

    const prompt = `
    You are an expert teacher. Create a comprehensive set of 15-20 Flashcards covering the key concepts from these learning resources:
    
    "${context}"
    
    IMPORTANT: Each flashcard should have:
    - "front": A SHORT TERM, CONCEPT NAME, or KEY PHRASE (NOT a question)
    - "back": A clear, concise definition or explanation
    
    Examples of GOOD flashcards:
    {"front": "React Hooks", "back": "Functions that let you use state and other React features in function components"}
    {"front": "useState", "back": "A React Hook that lets you add state to function components"}
    
    Examples of BAD flashcards (DO NOT DO THIS):
    {"front": "What are React Hooks?", "back": "..."} ❌ (front is a question)
    {"front": "Explain useState", "back": "..."} ❌ (front is a command)
    
    The output must be a valid JSON array of objects with this structure:
    [
        {
            "front": "Short Term or Concept Name",
            "back": "Concise Definition or Explanation"
        }
    ]
    Do not wrap in markdown code blocks. Just raw JSON.
    `;

    try {
        const { text } = await generateText({
            model: google("gemini-2.5-flash"),
            prompt: prompt,
        });

        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const cards = JSON.parse(jsonStr);

        await db.flashcard.createMany({
            data: cards.map((c: any) => ({
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
