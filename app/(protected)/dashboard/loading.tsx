import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* Bento Grid Layout Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Main: Large Card Skeleton */}
                <div className="lg:col-span-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />

                    {/* Filter Bar Skeleton */}
                    <div className="mt-4 h-[60px] w-full rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center px-4 gap-4">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                </div>

                {/* Side: Stats Skeleton */}
                <Skeleton className="h-[280px] w-full rounded-xl lg:col-span-1" />
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid gap-5 grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-[180px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
