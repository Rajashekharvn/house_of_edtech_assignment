"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, BookOpen, Loader2, CheckCircle } from "lucide-react";
import { cloneLearningPath } from "@/lib/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ExploreCardProps {
    path: {
        id: string;
        title: string;
        description: string | null;
        category: string | null;
        difficulty: string | null;
        _count: {
            resources: number;
        };
        user: {
            firstName: string | null;
            lastName: string | null;
        };
    };
    hasPath: boolean;
}

export function ExploreCard({ path, hasPath }: ExploreCardProps) {
    const [isCloning, setIsCloning] = useState(false);
    const router = useRouter();

    const handleClone = async () => {
        setIsCloning(true);
        try {
            await cloneLearningPath(path.id);
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to clone", error);
            alert(error instanceof Error ? error.message : "Failed to clone path");
        } finally {
            setIsCloning(false);
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow flex flex-col h-full border-slate-200 dark:border-border dark:bg-card">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                                {path.category || "General"}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                {path.difficulty || "All Levels"}
                            </span>
                        </div>
                        <CardTitle className="line-clamp-1 text-lg pt-1 text-slate-900 dark:text-slate-50">
                            {path.title}
                        </CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            by {path.user.firstName} {path.user.lastName}
                        </p>
                    </div>
                </div>
                <CardDescription className="line-clamp-2 min-h-[40px] pt-1 text-slate-500 dark:text-slate-400">
                    {path.description || "No description provided."}
                </CardDescription>
            </CardHeader>

            <CardContent className="pb-3 flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{path._count.resources} Resources</span>
                </div>
            </CardContent>

            <CardFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <Button
                    onClick={handleClone}
                    disabled={isCloning || hasPath}
                    className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-sm transition-all border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCloning ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Cloning...
                        </>
                    ) : hasPath ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Added to Dashboard
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Clone to Dashboard
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
