import { Trophy, Activity, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsStatsProps {
    quizAttempts: any[];
    completedResources: any[];
    streakCount: number;
}

export function AnalyticsStats({ quizAttempts, completedResources, streakCount }: AnalyticsStatsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Quizzes</CardTitle>
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                        <Trophy className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{quizAttempts.length}</div>
                    <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">Lifetime attempts</p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Resources Mastered</CardTitle>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                        <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{completedResources.length}</div>
                    <p className="text-emerald-600 dark:text-emerald-500 text-xs mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Keep learning!
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Study Streak</CardTitle>
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                        <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{streakCount}</div>
                    <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">Days in a row</p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400"> Avg. Score</CardTitle>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                        <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {quizAttempts.length > 0
                            ? Math.round(quizAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0) / quizAttempts.length) + "%"
                            : "N/A"
                        }
                    </div>
                    <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">Across all quizzes</p>
                </CardContent>
            </Card>
        </div>
    );
}
