import { getQuizHistory } from "@/lib/quiz-actions";
import { CheckCircle, XCircle, Clock, History, Trophy, Activity, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { QuizAttempt } from "@prisma/client";

export async function QuizHistory({ pathId }: { pathId: string }) {
    const history = await getQuizHistory(pathId);

    if (history.length === 0) {
        return null;
    }

    // Calculate stats
    const bestScore = Math.max(...history.map((h: QuizAttempt) => h.score));
    const averageScore = Math.round(history.reduce((acc: number, curr: QuizAttempt) => acc + curr.score, 0) / history.length);
    const totalAttempts = history.length;

    return (
        <div className="space-y-6">
            {/* Header - Matches Learning Modules Style */}
            <div className="flex items-center justify-between bg-white/50 dark:bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50 dark:border-border/50 sticky top-20 z-20 shadow-sm">
                <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100">
                    <span className="bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 w-8 h-8 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                    </span>
                    Performance Analytics
                </h2>
                <div className="text-xs font-medium px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-500">
                    Last 30 Days
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm group hover:border-violet-200 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <History className="w-16 h-16 text-violet-600" />
                    </div>
                    <div className="relative">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Total Attempts</div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalAttempts}</div>
                        <div className="mt-2 text-xs font-medium text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-full w-fit">
                            Lifetime
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm group hover:border-emerald-200 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy className="w-16 h-16 text-emerald-600" />
                    </div>
                    <div className="relative">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Best Score</div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{bestScore}<span className="text-lg text-slate-400 font-normal">/10</span></div>
                        <div className="mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full w-fit">
                            Personal Best
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm group hover:border-indigo-200 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-16 h-16 text-indigo-600" />
                    </div>
                    <div className="relative">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Average Score</div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{averageScore}<span className="text-lg text-slate-400 font-normal">/10</span></div>
                        <div className="mt-2 text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full w-fit">
                            Overall Performance
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity List */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Recent Activity</h3>
                <div className="space-y-3">
                    {history.map((attempt: QuizAttempt) => (
                        <div key={attempt.id} className="group relative bg-white dark:bg-zinc-900/80 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/5">
                            <div className="flex items-center gap-4">
                                {/* Icon Status */}
                                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${attempt.passed
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                                    : 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20'
                                    }`}>
                                    {attempt.passed ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                            {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${attempt.passed
                                            ? 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400'
                                            : 'bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400'
                                            }`}>
                                            {attempt.passed ? 'Passed' : 'Failed'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        {format(new Date(attempt.createdAt), 'MMM d, yyyy • h:mm a')}
                                    </div>
                                </div>

                                {/* Score Bar Visual */}
                                <div className="hidden sm:block w-48">
                                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                                        <span>Score</span>
                                        <span className="text-slate-900 dark:text-slate-200">{attempt.score}/{attempt.totalQuestions}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden ring-1 ring-slate-200/50 dark:ring-zinc-700/50">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${attempt.passed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                            style={{ width: `${(attempt.score / attempt.totalQuestions) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
