import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { UserButtonWrapper } from "@/components/UserButtonWrapper";
import { Sparkles, LayoutDashboard, Globe, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";

export const Header = async () => {
    const user = await checkUser();
    let streakCount = 0;

    if (user) {
        const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: { streakCount: true }
        });
        if (dbUser) streakCount = dbUser.streakCount;
    }

    return (
        <header className="h-16 border-b border-indigo-50 dark:border-white/5 flex items-center px-4 justify-between bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50">
            <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                <Sparkles className="h-6 w-6" />
                <span>MindSprout</span>
            </Link>

            <div className="flex items-center gap-4">
                {user && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-semibold border border-orange-100 dark:border-orange-900/50" title="Current Study Streak">
                        <Flame className="h-4 w-4 fill-orange-600 dark:fill-orange-400" />
                        <span>{streakCount}</span>
                    </div>
                )}

                <ThemeToggle />
                <Link href="/explore" className="hidden sm:inline-flex">
                    <Button variant="ghost" className="gap-2">
                        <Globe className="h-4 w-4" />
                        Explore
                    </Button>
                </Link>
                <Link href="/dashboard" className="hidden sm:inline-flex">
                    <Button variant="ghost" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Button>
                </Link>
                <UserButtonWrapper />
            </div>
        </header>
    );
};
