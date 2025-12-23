import { ShellLayout } from "@/components/ShellLayout";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function AppShell({ children }: { children: React.ReactNode }) {
    const user = await checkUser();

    if (!user) {
        redirect("/sign-in");
    }

    let streakCount = 0;
    if (user) {
        // Fetch streak count
        const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: { streakCount: true }
        });
        if (dbUser) streakCount = dbUser.streakCount;
    }

    return (
        <ShellLayout streakCount={streakCount}>
            {children}
        </ShellLayout>
    );
}
