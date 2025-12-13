
import { Header } from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950">
            <Header />
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header Skeleton */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-9 w-48 mb-2" />
                            <Skeleton className="h-5 w-64" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>

                    {/* Grid Skeleton */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-6 w-3/4" />
                                        </div>
                                        <Skeleton className="h-6 w-16 rounded" />
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
