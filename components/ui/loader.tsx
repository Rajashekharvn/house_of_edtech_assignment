"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";



export function FullPageLoader() {
    return (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center z-50">
            {/* Subtle Grid Background - kept for consistency but very faint */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

            <div className="relative flex flex-col items-center gap-8 z-10">
                {/* Minimalist Logo */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full animate-pulse" />
                    <Sparkles className="h-12 w-12 text-indigo-600 dark:text-indigo-400 fill-indigo-600/10 dark:fill-indigo-400/10 animate-pulse duration-[3000ms]" />
                </div>

                {/* Elegant Typography */}
                <div className="flex flex-col items-center gap-2">
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        MindSprout
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <div className="h-1 w-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-1 w-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-1 w-1 bg-indigo-500 rounded-full animate-bounce" />
                    </div>
                </div>
            </div>
        </div>
    );
}
