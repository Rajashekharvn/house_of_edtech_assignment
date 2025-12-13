import { checkUser } from "@/lib/checkUser";
import { Header } from "@/components/Header";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DashboardView } from "@/components/DashboardView";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await checkUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const rawPaths = await db.learningPath.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc", // Sort by recently updated
    },
    include: {
      resources: {
        select: {
          isCompleted: true
        }
      }
    }
  });

  // Transform data to include counts
  const paths = rawPaths.map((path: typeof rawPaths[0]) => ({
    ...path,
    _count: {
      resources: path.resources.length
    },
    completedCount: path.resources.filter((r: typeof path.resources[0]) => r.isCompleted).length
  }));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <Header />
      <main className="flex-1 p-8">
        <DashboardView user={user} paths={paths} />
      </main>
    </div>
  );
}
