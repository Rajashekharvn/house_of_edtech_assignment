"use client";

import { useState } from "react";
import { updateLearningPath } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { deleteLearningPath } from "@/lib/actions";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportPathToPDF } from "@/lib/pdf-export";
import { showToast } from "@/lib/toast";

interface PathHeaderProps {
    path: {
        id: string;
        title: string;
        description: string | null;
        category: string | null;
        difficulty: string | null;
        resources: Array<{
            title: string;
            url: string | null;
            content: string | null;
            summary: string | null;
        }>;
    };
}

export function PathHeader({ path }: PathHeaderProps) {
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [title, setTitle] = useState(path.title);
    const [description, setDescription] = useState(path.description || "");
    const [category, setCategory] = useState(path.category || "Development");
    const [difficulty, setDifficulty] = useState(path.difficulty || "Beginner");
    const [isExporting, setIsExporting] = useState(false);

    const handleUpdate = async (field: string, value: string) => {
        try {
            await updateLearningPath(path.id, { [field]: value });
            setIsEditing(null);
        } catch (error) {
            console.error("Failed to update path", error);
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
            showToast.success("PDF exported successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            showToast.error("Failed to export PDF. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const completedCount = path.resources.filter(r => r.summary && r.content === "completed" || (r as any).isCompleted).length; // Fallback or strict check
    // Actually, let's fix the detailed count logic based on what's available
    const realCompletedCount = path.resources.filter(r => (r as any).isCompleted).length;
    const totalCount = path.resources.length;
    const progress = totalCount === 0 ? 0 : Math.round((realCompletedCount / totalCount) * 100);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm p-6 group ring-1 ring-black/5 dark:ring-white/5">
            {/* Subtle Gradient Background - Neutral */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent opacity-100 transition-all duration-500" />

            <div className="flex flex-col gap-6 relative z-10">
                {/* Top Section: Title & Progress Ring */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                        <div className="space-y-1">
                            {isEditing === "title" ? (
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => handleUpdate("title", title)}
                                    onKeyDown={(e) => handleKeyDown(e, "title", title)}
                                    className="text-2xl font-bold h-10 bg-transparent border-indigo-200"
                                    autoFocus
                                />
                            ) : (
                                <h1
                                    onClick={() => setIsEditing("title")}
                                    className="text-2xl font-bold text-slate-900 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-tight"
                                    title="Click to edit title"
                                >
                                    {path.title}
                                </h1>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* Category Badge */}
                            {isEditing === "category" ? (
                                <Select value={category} onValueChange={(val) => { setCategory(val); handleUpdate("category", val); }}>
                                    <SelectTrigger className="h-7 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Development">Development</SelectItem>
                                        <SelectItem value="Design">Design</SelectItem>
                                        <SelectItem value="Business">Business</SelectItem>
                                        <SelectItem value="Marketing">Marketing</SelectItem>
                                        <SelectItem value="Data Science">Data Science</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <span onClick={() => setIsEditing("category")} className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider cursor-pointer border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors">
                                    {path.category || "Uncategorized"}
                                </span>
                            )}

                            {/* Difficulty Badge */}
                            {isEditing === "difficulty" ? (
                                <Select value={difficulty} onValueChange={(val) => { setDifficulty(val); handleUpdate("difficulty", val); }}>
                                    <SelectTrigger className="h-7 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <span onClick={() => setIsEditing("difficulty")} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider cursor-pointer border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors">
                                    {path.difficulty || "Levels"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Circular Progress Ring */}
                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-out" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-xs font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                    </div>
                </div>

                {/* Description */}
                {isEditing === "description" ? (
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={() => handleUpdate("description", description)}
                        className="text-sm min-h-[80px] bg-white/50 dark:bg-slate-900/50"
                    />
                ) : (
                    <p onClick={() => setIsEditing("description")} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                        {path.description || "Add a brief description to guide your learning..."}
                    </p>
                )}

                <div className="h-px w-full bg-indigo-50 dark:bg-indigo-500/10" />

                {/* Actions Footer */}
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={handleExport} disabled={isExporting}>
                        <Download className="w-3.5 h-3.5" /> {isExporting ? "Exporting..." : "Export"}
                    </Button>
                    <form action={async () => { await deleteLearningPath(path.id); }} className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
