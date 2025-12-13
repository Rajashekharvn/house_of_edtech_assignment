import { checkUser } from "@/lib/checkUser";
import { Header } from "@/components/Header";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ExploreCard } from "@/components/ExploreCard";
import { Globe, Users } from "lucide-react";

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

    const excludedPathIds = new Set(userPaths.map(p => p.id));
    userPaths.forEach(p => {
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
                select: { resources: true }
            },
            user: {
                select: {
                    firstName: true,
                    lastName: true
                }
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
                select: { resources: true }
            },
            user: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        }
    });

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <Header />
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
                        <div className="relative z-10">
                            <h1 className="text-4xl font-bold tracking-tight mb-2">Explore Community Paths</h1>
                            <p className="text-indigo-100 text-lg max-w-2xl">
                                Discover learning paths created by other scholars. Clone them to your dashboard to start your own journey.
                            </p>
                            <div className="flex items-center gap-6 mt-6">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                    <Globe className="w-5 h-5 text-indigo-300" />
                                    <span className="font-medium">{communityPaths.length} Public Paths</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                    <Users className="w-5 h-5 text-purple-300" />
                                    <span className="font-medium">Community Driven</span>
                                </div>
                            </div>
                        </div>
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                    </div>

                    {/* My Contributions Section */}
                    {myPublicPaths.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
                                My Contributions
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {myPublicPaths.map((path) => (
                                    <ExploreCard
                                        key={path.id}
                                        path={path}
                                        hasPath={true} // Users technically 'have' their own paths, though we might want special UI just for them? Reuse for now.
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Community Grid */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <div className="h-8 w-1 bg-purple-600 rounded-full"></div>
                            Community Paths
                        </h2>
                        {communityPaths.length === 0 ? (
                            <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center text-muted-foreground bg-white/50 dark:bg-slate-900/50">
                                <Globe className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No new paths to explore</h3>
                                <p className="max-w-md mx-auto text-sm">
                                    Check back later for new content from the community.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {communityPaths.map((path) => (
                                    <ExploreCard
                                        key={path.id}
                                        path={path}
                                        hasPath={false}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
