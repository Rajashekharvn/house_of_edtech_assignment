
import { checkUser } from "@/lib/checkUser";
import { Header } from "@/components/Header";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ExploreView } from "@/components/ExploreView";

export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
    const user = await checkUser();

    if (!user) {
        return redirect("/sign-in");
    }

    const userPaths = await db.learningPath.findMany({
        where: {
            userId: user.id
        },
        select: {
            id: true,
            clonedFromId: true
        }
    });

    const excludedPathIds = new Set(userPaths.map((p: typeof userPaths[0]) => p.id));
    userPaths.forEach((p: typeof userPaths[0]) => {
        if (p.clonedFromId) excludedPathIds.add(p.clonedFromId);
    });

    const myPublicPaths = await db.learningPath.findMany({
        where: {
            userId: user.id,
            isPublic: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            _count: {
                select: { resources: true, stars: true }
            },
            user: {
                select: {
                    firstName: true,
                    lastName: true
                }
            },
            stars: {
                where: { userId: user.id },
                select: { id: true }
            }
        }
    });

    const communityPaths = await db.learningPath.findMany({
        where: {
            isPublic: true,
            id: {
                notIn: Array.from(excludedPathIds)
            }
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            _count: {
                select: { resources: true, stars: true }
            },
            user: {
                select: {
                    firstName: true,
                    lastName: true
                }
            },
            stars: {
                where: { userId: user.id },
                select: { id: true }
            }
        }
    });

    // Transform to include isStarred
    const processPaths = (paths: any[]) => paths.map(path => ({
        ...path,
        isStarred: path.stars.length > 0
    }));

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
            <Header />
            <main className="flex-1 p-4 md:p-8">
                <ExploreView
                    communityPaths={processPaths(communityPaths)}
                    myPublicPaths={processPaths(myPublicPaths)}
                />
            </main>
        </div>
    );
}
