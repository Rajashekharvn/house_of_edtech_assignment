"use client";

import { useState } from "react";
import { updateLearningPath, deleteLearningPath } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Clock, BookOpen, Trophy, ArrowLeft, MoreHorizontal, ChevronRight, LayoutDashboard, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportPathToPDF } from "@/lib/pdf-export";
import { showToast } from "@/lib/toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BrainCircuit } from "lucide-react";

interface PathHeroProps {
    path: {
        id: string;
        title: string;
        description: string | null;
        category: string | null;
        difficulty: string | null;
        isPublic: boolean;
        resources: Array<{
            id: string;
            title: string;
            url: string | null;
            content: string | null;
            summary: string | null;
            isCompleted: boolean;
        }>;
        quiz?: any;
        userId?: string;
        user?: {
            firstName: string | null;
            lastName: string | null;
        };
    };
    backLink?: string;
}

export function PathHero({ path, backLink = "/dashboard", isReadOnly = false }: PathHeroProps & { isReadOnly?: boolean }) {
    // ... (rest of the component)

    // ...

    {
        isReadOnly && path.user && path.userId && (
            <p className="text-base font-medium text-slate-500 dark:text-slate-400">
                Created by <Link href={`/profile/${path.userId}`} className="text-slate-900 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors">{path.user.firstName} {path.user.lastName}</Link>
            </p>
        )
    }
    const router = useRouter();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [title, setTitle] = useState(path.title);
    const [description, setDescription] = useState(path.description || "");
    const [category, setCategory] = useState(path.category || "Development");
    const [difficulty, setDifficulty] = useState(path.difficulty || "Beginner");
    const [isPublic, setIsPublic] = useState(path.isPublic);
    const [isExporting, setIsExporting] = useState(false);

    const handleUpdate = async (field: string, value: string | boolean) => {
        if (isReadOnly) return;
        try {
            const res = await updateLearningPath(path.id, { [field]: value });
            if (res?.error) {
                showToast.error(res.error);
                return;
            }
            setIsEditing(null);
            showToast.success("Updated");
            router.refresh();
        } catch (error) {
            console.error("Failed to update path", error);
            showToast.error("Failed to update");
        }
    };

    const handleVisibilityToggle = async (checked: boolean) => {
        if (isReadOnly) return;
        if (checked && path.resources.length === 0) {
            showToast.error("Add resources to make public");
            return;
        }

        setIsPublic(checked);
        try {
            const res = await updateLearningPath(path.id, { isPublic: checked });
            if (res?.error) {
                setIsPublic(!checked); // revert
                showToast.error(res.error);
                return;
            }
            showToast.success(checked ? "Path is now Public" : "Path is now Private");
            router.refresh();
        } catch (error) {
            setIsPublic(!checked); // revert
            console.error("Failed to update visibility", error);
            showToast.error("Failed to update");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, field: string, value: string) => {
        if (e.key === "Enter") {
            handleUpdate(field, value);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportPathToPDF(path.title);
            showToast.success("Exported PDF");
        } catch (error) {
            console.error("Export failed:", error);
            showToast.error("Export failed");
        } finally {
            setIsExporting(false);
        }
    };

    const completedCount = path.resources.filter(r => r.isCompleted).length;
    const totalCount = path.resources.length;
    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
        <div id="path-hero" className="w-full max-w-6xl mx-auto mb-12 pt-8 px-4 md:px-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* 1. Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-8 font-medium">
                <Link href={isReadOnly ? "/explore" : "/dashboard"} className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
                    {isReadOnly ? <Trophy className="w-3.5 h-3.5" /> : <LayoutDashboard className="w-3.5 h-3.5" />}
                    {isReadOnly ? "Explore" : "Dashboard"}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-400 cursor-default">{category}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[150px] sm:max-w-[200px]">{title}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start justify-between">
                {/* Left Column: Title & Context */}
                <div className="flex-1 space-y-6 w-full max-w-3xl">
                    <div className="space-y-3">
                        {isEditing === "title" && !isReadOnly ? (
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={() => handleUpdate("title", title)}
                                onKeyDown={(e) => handleKeyDown(e, "title", title)}
                                className="text-4xl md:text-5xl font-bold tracking-tight bg-transparent border-none px-0 h-auto focus-visible:ring-0 placeholder-slate-300 dark:placeholder-slate-700 text-slate-900 dark:text-slate-100"
                                autoFocus
                            />
                        ) : (
                            <h1
                                onClick={() => !isReadOnly && setIsEditing("title")}
                                className={cn(
                                    "text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-tight",
                                    !isReadOnly && "cursor-text hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                )}
                            >
                                {path.title}
                            </h1>
                        )}

                        {isReadOnly && path.user && path.userId && (
                            <p className="text-base font-medium text-slate-500 dark:text-slate-400">
                                Created by <Link href={`/profile/${path.userId}`} className="text-slate-900 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors">{path.user.firstName} {path.user.lastName}</Link>
                            </p>
                        )}

                        {isEditing === "description" && !isReadOnly ? (
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={() => handleUpdate("description", description)}
                                className="text-lg bg-slate-50 border-slate-200 min-h-[80px]"
                            />
                        ) : (
                            <p
                                onClick={() => !isReadOnly && setIsEditing("description")}
                                className={cn(
                                    "text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl",
                                    !isReadOnly && "cursor-text hover:text-slate-600 transition-colors"
                                )}
                            >
                                {path.description || (isReadOnly ? "No description provided." : "Add a brief description to this learning path...")}
                            </p>
                        )}
                    </div>

                    {/* Meta & Stats Row */}
                    <div className="flex flex-wrap items-center gap-6 pt-2">
                        {/* Labels */}
                        <div className="flex items-center gap-3">
                            <BadgeSelect
                                value={category}
                                options={["Development", "Design", "Business", "Marketing", "Data Science"]}
                                isEditing={isEditing === "category" && !isReadOnly}
                                onEdit={() => !isReadOnly && setIsEditing("category")}
                                onChange={(v: string) => { setCategory(v); handleUpdate("category", v); }}
                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300"
                            />
                            <BadgeSelect
                                value={difficulty}
                                options={["Beginner", "Intermediate", "Advanced"]}
                                isEditing={isEditing === "difficulty" && !isReadOnly}
                                onEdit={() => !isReadOnly && setIsEditing("difficulty")}
                                onChange={(v: string) => { setDifficulty(v); handleUpdate("difficulty", v); }}
                                className={cn(
                                    "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm",
                                    difficulty === "Beginner" && "text-emerald-600 border-emerald-200 bg-emerald-50",
                                    difficulty === "Intermediate" && "text-blue-600 border-blue-200 bg-blue-50",
                                    difficulty === "Advanced" && "text-purple-600 border-purple-200 bg-purple-50"
                                )}
                            />
                        </div>

                        <div className="h-4 w-px bg-slate-200 dark:bg-zinc-700 hidden sm:block" />

                        {/* Metrics */}
                        <div className="flex items-center gap-5 text-sm font-medium text-slate-500">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-slate-400" />
                                <span>{totalCount} Modules</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>~2h</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & Progress Card */}
                <div className="flex flex-col items-start md:items-end gap-6 w-full md:w-auto">
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 no-export w-full md:w-auto justify-start md:justify-end">
                        {!isReadOnly && (
                            <div className="flex items-center gap-2 mr-2 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full border border-slate-200 dark:border-zinc-700">
                                <span className={cn("text-xs font-medium", isPublic ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500")}>
                                    {isPublic ? "Public" : "Private"}
                                </span>
                                <Switch
                                    checked={isPublic}
                                    onCheckedChange={handleVisibilityToggle}
                                    className={cn("data-[state=checked]:bg-indigo-600")}
                                />
                            </div>
                        )}
                        <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} className="gap-2 h-9">
                            <Share2 className="w-4 h-4" /> Export
                        </Button>
                        {!isReadOnly && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-9 w-9">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={async () => await deleteLearningPath(path.id)} className="text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete Path
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Progress Widget - Only show if not read only (owner view) or maybe show summary for visitors? For now hide. */}
                    {!isReadOnly && (
                        <div className="w-full md:w-64 bg-slate-50 dark:bg-zinc-900 rounded-xl p-4 border border-slate-100 dark:border-zinc-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Progress</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="mt-2 text-[11px] text-slate-400 text-right">
                                {completedCount} / {totalCount} completed
                            </div>

                            {progress === 100 && (
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                                    <Link href={`/dashboard/paths/${path.id}/quiz`}>
                                        <Button size="sm" className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
                                            <BrainCircuit className="w-4 h-4" /> Mastery Quiz
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <hr className="mt-12 border-slate-100 dark:border-zinc-800" />
        </div >
    );
}

// Badge Component
function BadgeSelect({ value, options, isEditing, onEdit, onChange, className }: any) {
    if (isEditing) {
        return (
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="h-7 text-xs w-[130px] bg-white dark:bg-zinc-900 focus:ring-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {options.map((opt: string) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }
    return (
        <span
            onClick={onEdit}
            className={cn("px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all hover:opacity-80 select-none", className)}
        >
            {value}
        </span>
    );
}
