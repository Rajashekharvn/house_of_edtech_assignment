
import { checkUser } from "@/lib/checkUser";

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
            },
            user: {
                isPrivate: false
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
        <div className="flex flex-col h-full">
            <main className="flex-1">
                <ExploreView
                    communityPaths={processPaths(communityPaths)}
                    myPublicPaths={processPaths(myPublicPaths)}
                />
            </main>
        </div>
    );
}
