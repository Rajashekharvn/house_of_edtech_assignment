import { checkUser } from "@/lib/checkUser";
import { redirect, notFound } from "next/navigation";
import { PathContent } from "@/components/PathContent";


export const dynamic = 'force-dynamic';

import { getQuizHistory } from "@/lib/quiz-actions";

import { getPathDetails } from "@/lib/actions";

// ...

export default async function PathDetailPage({ params }: { params: Promise<{ pathId: string }> }) {
    const user = await checkUser();
    if (!user) return redirect("/sign-in");

    const { pathId } = await params;

    // Use centralized fetcher that includes notes, stars, etc.
    const path = await getPathDetails(pathId);

    if (!path) {
        return notFound();
    }

    // Fetch quiz history
    const quizHistory = await getQuizHistory(pathId);

    return (
        <div className="h-full">
            <main id="learning-path-content" className="container mx-auto px-4 py-8 max-w-7xl">
                <PathContent initialPath={path as any} quizHistory={quizHistory} />
            </main>
        </div>
    );
}
