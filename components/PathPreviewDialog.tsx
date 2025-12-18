"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Copy, Star, Loader2, FileText, Video, Link as LinkIcon, Code } from "lucide-react";
import { useState, useEffect } from "react";
import { getPathDetails, cloneLearningPath, togglePathStar } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PathPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pathId: string;
}

export function PathPreviewDialog({ open, onOpenChange, pathId }: PathPreviewDialogProps) {
    const [path, setPath] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cloning, setCloning] = useState(false);
    const [starring, setStarring] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (open && pathId) {
            setLoading(true);
            getPathDetails(pathId)
                .then(setPath)
                .catch((err) => {
                    console.error(err);
                    toast.error("Failed to load path details");
                    onOpenChange(false);
                })
                .finally(() => setLoading(false));
        }
    }, [open, pathId, onOpenChange]);

    const handleClone = async () => {
        setCloning(true);
        try {
            await cloneLearningPath(pathId);
            toast.success("Path added to your dashboard!");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Failed to clone path");
        } finally {
            setCloning(false);
        }
    };

    const handleStar = async () => {
        if (!path) return;
        setStarring(true);
        // Optimistic update
        setPath((prev: any) => ({
            ...prev,
            isStarred: !prev.isStarred,
            _count: {
                ...prev._count,
                stars: prev.isStarred ? prev._count.stars - 1 : prev._count.stars + 1
            }
        }));

        try {
            await togglePathStar(pathId);
        } catch (error) {
            // Revert on failure
            setPath((prev: any) => ({
                ...prev,
                isStarred: !prev.isStarred,
                _count: {
                    ...prev._count,
                    stars: prev.isStarred ? prev._count.stars - 1 : prev._count.stars + 1
                }
            }));
            toast.error("Failed to update star");
        } finally {
            setStarring(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "video": return <Video className="w-4 h-4 text-blue-500" />;
            case "article": return <FileText className="w-4 h-4 text-orange-500" />;
            case "documentation": return <BookOpen className="w-4 h-4 text-purple-500" />;
            case "course": return <LinkIcon className="w-4 h-4 text-green-500" />;
            default: return <Code className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <DialogTitle className="sr-only">Loading Preview</DialogTitle>
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : path ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/20">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30">
                                            {path.category || "General"}
                                        </Badge>
                                        <Badge variant="outline" className="text-slate-500 dark:text-slate-400">
                                            {path.difficulty || "All Levels"}
                                        </Badge>
                                    </div>
                                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                        {path.title}
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                                        Created by <Link href={`/profile/${path.userId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">{path.user.firstName} {path.user.lastName}</Link> • {path._count.resources} Resources
                                    </DialogDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleStar}
                                    disabled={starring}
                                    className={cn(
                                        "gap-1.5 transition-colors",
                                        path.isStarred
                                            ? "text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-900/50"
                                            : "text-slate-600 dark:text-slate-400"
                                    )}
                                >
                                    <Star className={cn("w-4 h-4", path.isStarred && "fill-current")} />
                                    <span>{path._count.stars}</span>
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {path.description && (
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                                        {path.description}
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-indigo-500" />
                                        Resources Preview
                                    </h4>
                                    <div className="relative space-y-0 pl-4">
                                        {path.resources.map((res: any, index: number) => (
                                            <div key={res.id} className="relative pb-8 last:pb-0">
                                                {/* Connecting Line */}
                                                {index !== path.resources.length - 1 && (
                                                    <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-100 dark:bg-zinc-800" />
                                                )}

                                                <div className="flex gap-4">
                                                    {/* Number Badge */}
                                                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-100 bg-white text-xs font-bold text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-400">
                                                        {index + 1}
                                                    </div>

                                                    {/* Card */}
                                                    <div className="flex-1 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 rounded-md bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">
                                                                    {getIcon(res.type)}
                                                                </div>
                                                                <h5 className="font-semibold text-slate-900 dark:text-slate-200">
                                                                    {res.title}
                                                                </h5>
                                                            </div>
                                                            <Badge variant="secondary" className="capitalize text-[10px] px-1.5">
                                                                {res.type}
                                                            </Badge>
                                                        </div>

                                                        {res.summary && (
                                                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                                {res.summary}
                                                            </p>
                                                        )}

                                                        {!res.summary && res.url && (
                                                            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 font-mono truncate max-w-[300px]">
                                                                {res.url}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                            <Button
                                onClick={handleClone}
                                disabled={cloning}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                            >
                                {cloning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                                Clone to Dashboard
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center text-slate-500">
                        <DialogTitle className="sr-only">Path Not Found</DialogTitle>
                        Path not found
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
