"use client";

import { useState, useEffect, useMemo } from "react";
import { CreatePathDialog } from "@/components/CreatePathDialog";
import { PathCard } from "@/components/PathCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, CheckCircle, Search, Trophy, Zap, LayoutGrid, ArrowRight, Activity, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardOverview } from "@/components/DashboardOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsStats } from "@/components/dashboard/AnalyticsStats";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { GoalWidget } from "@/components/dashboard/GoalWidget";
import { Recommendations } from "@/components/dashboard/Recommendations";

interface DashboardViewProps {
    user: {
        firstName: string | null;
        streakCount: number;
    };
    paths: Array<{
        id: string;
        title: string;
        description: string | null;
        category: string | null;
        difficulty: string | null;
        updatedAt: Date;
        _count: {
            resources: number;
        };
        completedCount: number;
    }>;
    analytics: {
        quizAttempts: any[];
        completedResources: any[];
    };
    goals: any[];
    recommendations: any[];
}

export function DashboardView({ user, paths, analytics, goals, recommendations }: DashboardViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Dynamic Categories
    const categories = useMemo(() => {
        return ["All", ...Array.from(new Set(paths.map(p => p.category).filter(Boolean))) as string[]];
    }, [paths]);

    // Filter Logic
    const filteredPaths = useMemo(() => {
        return paths.filter(path => {
            const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                path.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === "All" || path.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [paths, searchQuery, categoryFilter]);

    // Stats Calculation
    const stats = useMemo(() => {
        const totalPaths = paths.length;
        const totalResources = paths.reduce((acc, curr) => acc + curr._count.resources, 0);
        const totalCompleted = paths.reduce((acc, curr) => acc + curr.completedCount, 0);
        const overallProgress = totalResources > 0 ? Math.round((totalCompleted / totalResources) * 100) : 0;
        return { totalPaths, totalResources, totalCompleted, overallProgress };
    }, [paths]);

    const { totalPaths, totalResources, totalCompleted, overallProgress } = stats;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-0.5 text-slate-600 dark:text-slate-400">
                        Welcome back, {user.firstName || "Scholar"}!
                    </p>
                </div>
                <CreatePathDialog />
            </div>

            <Tabs defaultValue="dashboard" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <TabsTrigger value="dashboard" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                        <LayoutGrid className="w-4 h-4 mr-2" /> Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                        <BarChart2 className="w-4 h-4 mr-2" /> Performance Analysis
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6 focus-visible:outline-none ring-offset-background">
                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

                        {/* Main: Jump Back In (Spans 3 cols) */}
                        <div className="lg:col-span-3">
                            {(() => {
                                const activePathWithWork = paths.find(p => p.completedCount < p._count.resources);
                                if (activePathWithWork) {
                                    const progress = Math.round((activePathWithWork.completedCount / activePathWithWork._count.resources) * 100);
                                    return (
                                        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 opacity-50" />
                                            <div className="relative z-10 flex items-center justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/20">
                                                        <Zap className="w-3 h-3" />
                                                        <span>Continue Learning</span>
                                                    </div>
                                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                                        {activePathWithWork.title}
                                                    </h2>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                                        You're <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{progress}%</span> complete. Keep going!
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{progress}%</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{activePathWithWork.completedCount}/{activePathWithWork._count.resources} done</div>
                                                    </div>
                                                    <Button
                                                        size="default"
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg border-0"
                                                        asChild
                                                    >
                                                        <a href={`/dashboard/paths/${activePathWithWork.id}`}>
                                                            Resume <ArrowRight className="ml-1 w-4 h-4" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                // Fallback if no active path
                                return (
                                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-center min-h-[160px]">
                                        <BookOpen className="w-10 h-10 text-slate-600 dark:text-slate-400 mb-3" />
                                        <h3 className="text-base font-medium text-slate-900 dark:text-slate-200">No active paths</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Start a new learning journey today.</p>
                                        <CreatePathDialog />
                                    </div>
                                );
                            })()}

                            {/* Filter & Search Bar */}
                            <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Search your learning paths..."
                                        className="pl-9 bg-slate-100 dark:bg-black/20 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500/50"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                {mounted ? (
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger className="w-full sm:w-[160px] bg-slate-100 dark:bg-black/20 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                                            {categories.map(cat => (
                                                <SelectItem key={cat} value={cat} className="focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white">{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="w-full sm:w-[160px] h-10 bg-white/5 border border-white/10 rounded-md" />
                                )}
                            </div>
                        </div>

                        {/* Side: Progress Overview (1 col) */}
                        <div className="col-span-1">
                            <DashboardOverview
                                totalPaths={totalPaths}
                                totalResources={totalResources}
                                totalCompleted={totalCompleted}
                                totalTopics={categories.length - 1}
                                overallProgress={overallProgress}
                            />
                        </div>
                    </div>

                    {/* Content Grid */}
                    {filteredPaths.length === 0 ? (
                        <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center text-muted-foreground bg-white/50 dark:bg-slate-900/50">
                            <BookOpen className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No paths found</h3>
                            <p className="mb-6 text-slate-500 dark:text-slate-400">Try adjusting your filters or create a new path.</p>
                            <CreatePathDialog />
                        </div>
                    ) : (
                        <div className="grid gap-5 grid-cols-2 lg:grid-cols-3">
                            {filteredPaths.map((path) => (
                                <PathCard key={path.id} path={path} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6 focus-visible:outline-none ring-offset-background">
                    <AnalyticsStats
                        quizAttempts={analytics.quizAttempts}
                        completedResources={analytics.completedResources}
                        streakCount={user.streakCount}
                    />

                    <div className="space-y-6">
                        <AnalyticsDashboard
                            quizAttempts={analytics.quizAttempts}
                            completedResources={analytics.completedResources}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <GoalWidget goals={goals} streakCount={user.streakCount} />
                            <Recommendations recommendations={recommendations} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
