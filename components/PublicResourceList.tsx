"use client";

import { ResourceCard } from "@/components/ResourceCard";

interface PublicResourceListProps {
    resources: Array<{
        id: string;
        title: string;
        type: string;
        url?: string | null;
        content?: string | null;
        summary?: string | null;
        pathId: string;
        isCompleted: boolean;
        quiz?: any;
        flashcards?: any[];
    }>;
}

export function PublicResourceList({ resources }: PublicResourceListProps) {
    return (
        <div className="space-y-6">
            {resources.map((resource, index) => (
                <div key={resource.id} className="relative pl-8 md:pl-0 group">
                    {/* Connecting Line (Desktop) */}
                    {index !== resources.length - 1 && (
                        <div className="hidden md:block absolute left-8 top-16 bottom-0 w-0.5 bg-slate-200 dark:bg-zinc-800 -z-10 group-last:hidden" />
                    )}

                    <div className="md:pl-16 relative">
                        {/* Number Badge */}
                        <div className="absolute left-0 top-6 hidden md:flex w-10 h-10 rounded-full items-center justify-center font-bold text-sm bg-white dark:bg-zinc-800 text-slate-400 border-4 border-slate-50 dark:border-black dark:border-zinc-700 z-10 transition-colors">
                            {index + 1}
                        </div>
                        <ResourceCard resource={resource} isReadOnly={true} />
                    </div>
                </div>
            ))}
        </div>
    );
}
