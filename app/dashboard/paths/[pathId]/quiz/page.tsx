
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";

import { redirect, notFound } from "next/navigation";
import { QuizView } from "@/components/QuizView";

export default async function QuizPage({ params }: { params: Promise<{ pathId: string }> }) {
    const user = await checkUser();
    if (!user) return redirect("/sign-in");

    const { pathId } = await params;

    const path = await db.learningPath.findUnique({
        where: {
            id: pathId,
            userId: user.id,
        },
        include: {
            quiz: true,
            resources: {
                select: {
                    isCompleted: true
                }
            }
        },
    });

    if (!path) {
        return notFound();
    }

    // Security Verification: Ensure all resources are completed
    const completedResources = path.resources.filter(r => r.isCompleted).length;
    const totalResources = path.resources.length;
    const isFullyCompleted = totalResources > 0 && completedResources === totalResources;

    if (!isFullyCompleted) {
        // Redirect back if trying to access quiz without completing resources
        return redirect(`/dashboard/paths/${path.id}`);
    }

    return (
        <div className="h-full flex flex-col transition-colors duration-300 overflow-hidden">
            <main className="flex-1 w-full overflow-hidden animate-in fade-in duration-500">
                <QuizView pathId={path.id} existingQuiz={path.quiz} />
            </main>
        </div>
    );
}
