"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Path {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    difficulty: string | null;
    _count: {
        resources: number;
        stars?: number; // Optional as not all queries might return it, but we will fetch it
    };
    user: {
        firstName: string | null;
        lastName: string | null;
    };
}

interface PopularPathsProps {
    paths: Path[];
}

export function PopularPaths({ paths }: PopularPathsProps) {
    if (!paths || paths.length === 0) return null;

    return (
        <section className="py-24 px-6 bg-slate-50 dark:bg-black/20 border-y border-slate-200 dark:border-white/5">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
                            Popular Learning <span className="text-indigo-600 dark:text-indigo-400">Paths</span>
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                            Discover structured roadmaps created by the community. Clone them to your dashboard and start tracking your progress.
                        </p>
                    </div>
                    <Link href="/explore">
                        <Button variant="outline" className="hidden md:flex gap-2 rounded-full border-slate-200 dark:border-white/10">
                            Explore All <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paths.map((path) => (
                        <div key={path.id} className="group flex flex-col justify-between bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/30">
                                        {path.category || "General"}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span>{path._count.stars || 0}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {path.title}
                                </h3>

                                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 h-10">
                                    {path.description || "Start your journey to mastery with this curated learning path."}
                                </p>

                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 mb-6">
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{path.user.firstName || "Anonymous"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>{path._count.resources} Resources</span>
                                    </div>
                                </div>
                            </div>

                            <Link href={`/sign-up?redirect=/dashboard/paths/${path.id}`} className="w-full">
                                <Button className="w-full gap-2 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 dark:hover:text-white transition-all shadow-md">
                                    Start Learning <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link href="/explore">
                        <Button variant="outline" className="w-full gap-2 rounded-full border-slate-200 dark:border-white/10">
                            Explore All <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
