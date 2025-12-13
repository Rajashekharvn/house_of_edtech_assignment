"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowRight, BookOpen, MoreVertical, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { deleteLearningPath, cloneLearningPath } from "@/lib/actions";
import { useState } from "react";

interface PathCardProps {
    path: {
        id: string;
        title: string;
        description: string | null;
        category: string | null;
        difficulty: string | null;
        updatedAt: Date;
        _count: {
            resources: number;
        };
        completedCount: number; // Derived/Passed property
    };
}

export function PathCard({ path }: PathCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const progress = path._count.resources > 0
        ? Math.round((path.completedCount / path._count.resources) * 100)
        : 0;

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this learning path? This action cannot be undone.")) {
            setIsDeleting(true);
            try {
                await deleteLearningPath(path.id);
            } catch (error) {
                console.error("Failed to delete", error);
                setIsDeleting(false);
            }
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow group flex flex-col h-full border-slate-200 dark:border-border dark:bg-card">
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
                        <Link href={`/dashboard/paths/${path.id}`} className="block">
                            <CardTitle className="line-clamp-1 text-lg group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors pt-1 text-slate-900 dark:text-slate-50">
                                {path.title}
                            </CardTitle>
                        </Link>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/paths/${path.id}`} className="cursor-pointer">
                                    <Edit className="w-4 h-4 mr-2" /> Edit Path
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 cursor-pointer"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2 min-h-[40px] pt-1 text-slate-500 dark:text-slate-400">
                    {path.description || "No description provided."}
                </CardDescription>
            </CardHeader>

            <CardContent className="pb-3 flex-1">
                <div className="space-y-3">
                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{path.completedCount} / {path._count.resources} Resources completed</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-3 border-t border-slate-100 dark:border-border bg-slate-50/50 dark:bg-black/20">
                <Link href={`/dashboard/paths/${path.id}`} className="w-full">
                    <Button className="w-full gap-2 bg-white text-indigo-600 hover:bg-indigo-50 border-input dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-700 dark:border-0 shadow-sm transition-all">
                        Continue Learning
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
