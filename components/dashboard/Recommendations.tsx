"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, RefreshCw, Lightbulb } from "lucide-react";
import Link from "next/link";

interface Recommendation {
    id: string;
    type: string;
    title: string;
    description: string;
    pathId: string;
    actionLabel: string;
}

interface RecommendationsProps {
    recommendations: Recommendation[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
    if (recommendations.length === 0) return null;

    if (recommendations.length === 0) return null;

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100 dark:fill-indigo-900" />
                    <CardTitle className="text-lg font-bold">AI Suggestions</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {recommendations.map(rec => (
                    <div key={rec.id} className="group flex gap-4 items-start p-3 -mx-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="mt-1 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                            {rec.type === "REVIEW" ? <RefreshCw className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{rec.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {rec.description}
                            </p>
                            <Link
                                href={`/dashboard/paths/${rec.pathId}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline mt-1"
                            >
                                {rec.actionLabel} <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
