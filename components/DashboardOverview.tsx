"use client";

import { Activity, BookOpen, Trophy, CheckCircle2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardOverviewProps {
    totalPaths: number;
    totalResources: number;
    totalCompleted: number;
    totalTopics: number;
    overallProgress: number;
}

export function DashboardOverview({ totalPaths, totalResources, totalCompleted, totalTopics, overallProgress }: DashboardOverviewProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between h-full min-h-[200px]">
            <h3 className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2 mb-4 text-sm">
                <Activity className="w-4 h-4 text-indigo-500" />
                Overview
            </h3>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    {/* Active Paths */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-xs font-medium">Active</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalPaths}</p>
                    </div>

                    {/* Total Resources */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Activity className="w-4 h-4" />
                            <span className="text-xs font-medium">Resources</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalResources}</p>
                    </div>

                    {/* Completed Resources */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-medium">Completed</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCompleted}</p>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Layers className="w-4 h-4" />
                            <span className="text-xs font-medium">Topics</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalTopics}</p>
                    </div>
                </div>

                {/* Completion Status */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Trophy className="w-3 h-3 text-yellow-500" />
                            <span>Completion</span>
                        </div>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{overallProgress}%</span>
                    </div>
                    <div className="relative h-2 w-full bg-slate-100 dark:bg-black/20 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
