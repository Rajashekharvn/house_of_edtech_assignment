import { getUserProfile } from "@/lib/actions";
import { notFound, redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import { FollowButton } from "@/components/FollowButton";
import { ExploreCard } from "@/components/ExploreCard";
import { UserListDialog } from "@/components/UserListDialog";
import { CreatePathDialog } from "@/components/CreatePathDialog";
import { User, Users, FileText, Calendar } from "lucide-react";
import { db } from "@/lib/db";
import { Header } from "@/components/Header";

interface ProfilePageProps {
    params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { userId } = await params;

    // Fetch profile data
    const profile = await getUserProfile(userId);
    if (!profile) return notFound();

    const { user, stats, paths, isFollowing } = profile;
    const currentUser = await checkUser();
    const isOwnProfile = currentUser?.id === user.id;

    // Check which paths current user already has
    let myPathIds = new Set<string>();
    if (currentUser) {
        const myPaths = await db.learningPath.findMany({
            where: { userId: currentUser.id },
            select: { clonedFromId: true, id: true }
        });
        myPaths.forEach(p => {
            if (p.clonedFromId) myPathIds.add(p.clonedFromId);
        });
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">
            <Header />
            <main className="p-4 md:p-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Header Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
                        {/* Avatar Placeholder */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-zinc-800 shadow-xl shrink-0">
                            {user.firstName?.[0] || "U"}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                        {user.firstName} {user.lastName}
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {!isOwnProfile ? (
                                    <FollowButton targetUserId={user.id} initialIsFollowing={isFollowing} />
                                ) : (
                                    <CreatePathDialog />
                                )}
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-center justify-center md:justify-start gap-6 md:gap-12 pt-2 border-t border-slate-100 dark:border-zinc-800/50">
                                <UserListDialog
                                    userId={user.id}
                                    type="followers"
                                    count={stats.followers}
                                    trigger={
                                        <button className="text-center md:text-left hover:opacity-75 transition-opacity">
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.followers}</p>
                                            <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Followers</p>
                                        </button>
                                    }
                                />
                                <UserListDialog
                                    userId={user.id}
                                    type="following"
                                    count={stats.following}
                                    trigger={
                                        <button className="text-center md:text-left hover:opacity-75 transition-opacity">
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.following}</p>
                                            <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Following</p>
                                        </button>
                                    }
                                />
                                <div className="text-center md:text-left">
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.paths}</p>
                                    <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Public Paths</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            Public Learning Paths
                        </h2>

                        {paths.length > 0 ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paths.map((path: any) => (
                                    <ExploreCard
                                        key={path.id}
                                        path={{
                                            ...path,
                                            isStarred: false
                                        }}
                                        hasPath={myPathIds.has(path.id)}
                                        isOwner={isOwnProfile}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                                <p className="text-slate-500">No public learning paths yet.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
