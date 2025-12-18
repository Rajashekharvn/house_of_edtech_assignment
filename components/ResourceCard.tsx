"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { deleteResource, toggleResourceCompletion, clearResourceSummary } from "@/lib/actions";
import { ExternalLink, Trash2, Video, FileText, Sparkles, Loader2, Code, StickyNote, RefreshCw, X, BookOpen, GraduationCap, Mic, Monitor, Book, Pencil, MoreVertical, PlayCircle, BookOpenCheck } from "lucide-react";
import { useState } from "react";
import { generateResourceSummary } from "@/lib/ai-actions";
import dynamic from "next/dynamic";
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { showToast } from "@/lib/toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ReactMarkdown = dynamic(() => import('react-markdown'), {
    loading: () => <div className="animate-pulse h-20 bg-slate-100 dark:bg-slate-800 rounded-md" />
});

const SyntaxHighlighter = dynamic(() => import('react-syntax-highlighter').then(mod => mod.Prism), {
    loading: () => <div className="animate-pulse h-24 bg-[#1e1e1e] rounded-lg border border-slate-800" />
});

// Update Resource Type
type Resource = {
    id: string;
    title: string;
    url?: string | null;
    content?: string | null;
    type: string;
    isCompleted: boolean;
    pathId: string;
    summary?: string | null;
    quiz?: {
        id: string;
        questions: any;
    } | null;
    flashcards?: any[];
};

export function ResourceCard({ resource, isReadOnly = false }: { resource: Resource, isReadOnly?: boolean }) {
    const [isCompleted, setIsCompleted] = useState(resource.isCompleted);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const handleToggle = async (checked: boolean) => {
        if (isReadOnly) return;
        setIsCompleted(checked);
        await toggleResourceCompletion(resource.id, checked, resource.pathId);
    };

    const handleSummarize = async () => {
        setIsSummarizing(true);
        const toastId = showToast.loading("Generating AI summary...");
        try {
            await generateResourceSummary(resource.id, resource.pathId);
            showToast.dismiss(toastId);
            showToast.success("Summary generated successfully!");
        } catch (e) {
            console.error(e);
            showToast.dismiss(toastId);
            showToast.error((e as Error).message || "Failed to generate summary");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleClearSummary = async () => {
        try {
            await clearResourceSummary(resource.id, resource.pathId);
            showToast.success("Summary cleared");
        } catch (e) {
            console.error(e);
            showToast.error("Failed to clear summary");
        }
    };

    const getIcon = () => {
        switch (resource.type) {
            case 'video': return <Video className="w-5 h-5 text-red-500" />;
            case 'pdf': return <FileText className="w-5 h-5 text-orange-500" />;
            case 'book': return <Book className="w-5 h-5 text-indigo-500" />;
            case 'course': return <GraduationCap className="w-5 h-5 text-blue-500" />;
            case 'podcast': return <Mic className="w-5 h-5 text-purple-500" />;
            case 'tutorial': return <Monitor className="w-5 h-5 text-cyan-500" />;
            case 'documentation': return <BookOpen className="w-5 h-5 text-emerald-500" />;
            case 'code': return <Code className="w-5 h-5 text-amber-500" />;
            case 'exercise': return <Pencil className="w-5 h-5 text-pink-500" />;
            case 'text': return <StickyNote className="w-5 h-5 text-yellow-500" />;
            default: return <FileText className="w-5 h-5 text-slate-500" />;
        }
    };

    // Derived state for Primary Action
    const PrimaryAction = () => {
        if (!resource.url) return null;

        const isVideo = resource.type === 'video';
        const Label = isVideo ? "Watch Video" : "Read Article";
        const Icon = isVideo ? PlayCircle : ExternalLink;

        return (
            <Button variant="outline" size="sm" className="gap-2 h-9 font-medium text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 min-w-[140px]" asChild>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {Label} <Icon className="w-3.5 h-3.5 ml-1 opacity-70" />
                </a>
            </Button>
        );
    };

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <Card className={`group relative transition-all duration-300 border border-slate-200 dark:border-zinc-800 shadow-sm ${isCompleted && !isReadOnly
            ? 'bg-slate-50/50 dark:bg-zinc-900/20'
            : 'bg-white dark:bg-zinc-900 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800'}`}>

            {/* Completed Badge (Overlay) */}
            {isCompleted && !isReadOnly && (
                <div className="absolute top-0 right-0 p-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                        <BookOpenCheck className="w-3 h-3" /> Completed
                    </span>
                </div>
            )}

            <div className="p-6">
                <div className="flex items-start gap-4 md:gap-6">
                    {/* Left: Type Indicator & Checkbox */}
                    <div className="flex flex-col items-center gap-4 shrink-0">
                        <div className={`p-3 rounded-2xl transition-colors ${isCompleted && !isReadOnly
                            ? 'bg-slate-100 dark:bg-zinc-800 grayscale opacity-60'
                            : 'bg-slate-50 dark:bg-zinc-800/50 ring-1 ring-slate-100 dark:ring-zinc-700'}`}>
                            {getIcon()}
                        </div>
                        {!isReadOnly && (
                            <div className="relative">
                                <Checkbox
                                    checked={isCompleted}
                                    onCheckedChange={handleToggle}
                                    className={`w-5 h-5 rounded-md border-2 transition-all duration-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white ${!isCompleted ? 'border-slate-300 dark:border-slate-600' : ''}`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Middle: Content & Meta */}
                    <div className="flex-1 min-w-0 space-y-4">
                        <div className="space-y-1">
                            {/* Category Label */}
                            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1">
                                {resource.type}
                            </div>

                            {/* Title */}
                            <h3 className={`text-lg font-bold leading-snug transition-colors ${isCompleted
                                ? 'text-slate-500 dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                                {resource.title}
                            </h3>

                            {/* URL (Light) */}
                            {resource.url && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-md font-mono opacity-80">
                                    {resource.url}
                                </p>
                            )}
                        </div>

                        {/* Inline Content (Video/Code) */}
                        <div className="space-y-4">
                            {resource.type === 'video' && resource.url && (
                                <div className="aspect-video w-full max-w-xl rounded-xl overflow-hidden shadow-sm bg-black ring-1 ring-black/5 mt-2">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${getYoutubeId(resource.url)}`}
                                        title={resource.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="border-0"
                                    />
                                </div>
                            )}

                            {resource.type === 'code' && resource.content && (
                                <div className="rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-zinc-800 mt-2">
                                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                    </div>
                                    <SyntaxHighlighter
                                        language="javascript"
                                        style={vscDarkPlus}
                                        customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px', maxWidth: '100%', overflowX: 'auto' }}
                                        showLineNumbers={true}
                                        wrapLongLines={false} // Ensure it scrolls rather than wraps if user prefers, usually code blocks scroll.
                                    >
                                        {resource.content}
                                    </SyntaxHighlighter>
                                </div>
                            )}

                            {resource.type === 'text' && resource.content && (
                                <div className="bg-amber-50 dark:bg-amber-950/10 border-l-4 border-amber-300 dark:border-amber-700/50 p-4 rounded-r-lg text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed mt-2">
                                    {resource.content}
                                </div>
                            )}
                        </div>

                        {/* Summary Section - Clean & Boxed */}
                        {resource.summary && (
                            <div className="mt-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-800/30 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">AI Summary</span>
                                </div>
                                <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                    <ReactMarkdown>{resource.summary}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex flex-wrap items-center justify-between pt-2 gap-y-2">
                            <div className="flex items-center gap-3">
                                <PrimaryAction />
                                {!resource.summary && !isReadOnly && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSummarize}
                                        className="gap-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 h-8 text-xs font-medium"
                                        disabled={isSummarizing}
                                    >
                                        {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                                        {isSummarizing ? "Thinking..." : "Summarize"}
                                    </Button>
                                )}
                            </div>

                            {/* Secondary Actions Dropdown */}
                            {!isReadOnly && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        {resource.summary && (
                                            <>
                                                <DropdownMenuItem onClick={handleSummarize} disabled={isSummarizing}>
                                                    <RefreshCw className="w-4 h-4 mr-2" /> Regenerate Summary
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={handleClearSummary} className="text-amber-600 focus:text-amber-700 focus:bg-amber-50">
                                                    <X className="w-4 h-4 mr-2" /> Clear Summary
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuItem onClick={async () => await deleteResource(resource.id, resource.pathId)} className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/20">
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete Resource
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
