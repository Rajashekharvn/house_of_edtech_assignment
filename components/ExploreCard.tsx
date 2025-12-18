"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, BookOpen, Loader2, CheckCircle, Eye, Star, ArrowRight } from "lucide-react";
import { cloneLearningPath, togglePathStar } from "@/lib/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PathPreviewDialog } from "@/components/PathPreviewDialog";
import { toast } from "sonner";

interface ExploreCardProps {
    path: {
        id: string;
        title: string;
        description: string | null;
        category: string | null;
        difficulty: string | null;
        _count: {
            resources: number;
            stars?: number;
        };
        userId: string;
        user: {
            firstName: string | null;
            lastName: string | null;
        };
        isStarred?: boolean; // Optimistic / specific to user
    };
    hasPath: boolean;
    isOwner?: boolean;
}

export function ExploreCard({ path, hasPath, isOwner }: ExploreCardProps) {
    const [isCloning, setIsCloning] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isStarred, setIsStarred] = useState(path.isStarred || false);
    const [starCount, setStarCount] = useState(path._count.stars || 0);

    const router = useRouter();

    const handleClone = async () => {
        setIsCloning(true);
        try {
            await cloneLearningPath(path.id);
            toast.success("Path added to dashboard");
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to clone", error);
            toast.error(error instanceof Error ? error.message : "Failed to clone path");
        } finally {
            setIsCloning(false);
        }
    };

    const handleStar = async () => {
        // Optimistic update
        setIsStarred(!isStarred);
        setStarCount(prev => isStarred ? prev - 1 : prev + 1);

        try {
            await togglePathStar(path.id);
        } catch (error) {
            // Revert
            setIsStarred(!isStarred);
            setStarCount(prev => isStarred ? prev - 1 : prev + 1);
            toast.error("Failed to star path");
        }
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow group flex flex-col h-full border-slate-200 dark:border-border dark:bg-card">
                <CardHeader className="pb-1 sm:pb-3">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1 w-full">
                            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                                        {path.category || "General"}
                                    </span>
                                    <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                        {path.difficulty || "All Levels"}
                                    </span>
                                </div>
                                <button
                                    onClick={handleStar}
                                    className={cn(
                                        "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors border",
                                        isStarred
                                            ? "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/50"
                                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                    )}
                                >
                                    <Star className={cn("w-3 h-3", isStarred && "fill-current")} />
                                    <span>{starCount}</span>
                                </button>
                            </div>
                            <CardTitle className="line-clamp-1 text-lg group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors pt-1 text-slate-900 dark:text-slate-50">
                                {path.title}
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                by <Link href={`/profile/${path.userId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">{path.user.firstName} {path.user.lastName}</Link>
                            </p>
                        </div>
                    </div>
                    <CardDescription className="hidden md:block line-clamp-2 min-h-[40px] pt-1 text-slate-500 dark:text-slate-400">
                        {path.description || "No description provided."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-1 sm:pb-3 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>{path._count.resources} Resources</span>
                    </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-slate-100 dark:border-border bg-slate-50/50 dark:bg-black/20 flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowPreview(true)}
                        className="flex-1 gap-2 h-9 text-xs sm:text-sm bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                    </Button>
                    <Button
                        onClick={isOwner ? () => router.push(`/dashboard/paths/${path.id}`) : handleClone}
                        disabled={isCloning || (hasPath && !isOwner)}
                        className={cn(
                            "flex-1 gap-2 shadow-sm transition-all px-2 h-9 text-xs sm:text-sm",
                            hasPath && !isOwner
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900"
                                : "bg-white text-indigo-600 hover:bg-indigo-50 border border-input dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-700 dark:border-0"
                        )}
                    >
                        {isOwner ? (
                            <>
                                <span>Continue</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </>
                        ) : isCloning ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Cloning...</span>
                            </>
                        ) : hasPath ? (
                            <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Added</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Clone</span>
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <PathPreviewDialog
                open={showPreview}
                onOpenChange={setShowPreview}
                pathId={path.id}
            />
        </>
    );
}
