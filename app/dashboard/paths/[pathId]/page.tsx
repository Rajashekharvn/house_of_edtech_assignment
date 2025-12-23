import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";

import { redirect, notFound } from "next/navigation";
import { PathContent } from "@/components/PathContent";


export const dynamic = 'force-dynamic';

export default async function PathDetailPage({ params }: { params: Promise<{ pathId: string }> }) {
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
            flashcards: true,
            resources: {
                orderBy: {
                    createdAt: "desc",
                }
            },
        },
    });

    if (!path) {
        return notFound();
    }
    const totalResources = path.resources.length;
    const completedResources = path.resources.filter((r: typeof path.resources[0]) => r.isCompleted).length;
    const completionPercentage = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;
    const isFullyCompleted = completionPercentage === 100;

    return (
        <div className="h-full">
            <main id="learning-path-content" className="container mx-auto px-4 py-8 max-w-7xl">
                <PathContent initialPath={path as any} />
            </main>
        </div>
    );
}
