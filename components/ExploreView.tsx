"use client";

import { ExploreCard } from "@/components/ExploreCard";
import { Compass, Globe, LayoutGrid, UserCircle, Search, Filter, ArrowUpDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";

interface Path {
    id: string;
    clonedFromId: string | null;
    isPublic: boolean;
    createdAt: Date;
    user: {
        firstName: string | null;
        lastName: string | null;
    };
    _count: { resources: number };
    title: string;
    description: string | null;
    category: string | null;
    difficulty: string | null;
}

interface ExploreViewProps {
    communityPaths: any[];
    myPublicPaths: any[];
}

export function ExploreView({ communityPaths, myPublicPaths }: ExploreViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [difficultyFilter, setDifficultyFilter] = useState("All");
    const [sortBy, setSortBy] = useState("newest");

    // Extract unique categories dynamically
    const allCategories = useMemo(() => {
        const categories = new Set<string>();
        [...communityPaths, ...myPublicPaths].forEach(path => {
            if (path.category) categories.add(path.category);
        });
        return ["All", ...Array.from(categories)];
    }, [communityPaths, myPublicPaths]);

    // Filter and Sort Logic
    const processPaths = (paths: any[]) => {
        return paths
            .filter(path => {
                const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    path.description?.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = categoryFilter === "All" || path.category === categoryFilter;
                const matchesDifficulty = difficultyFilter === "All" || path.difficulty === difficultyFilter;
                return matchesSearch && matchesCategory && matchesDifficulty;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case "newest":
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    case "oldest":
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    case "most_resources":
                        return b._count.resources - a._count.resources;
                    default:
                        return 0;
                }
            });
    };

    const filteredCommunityPaths = processPaths(communityPaths);
    const filteredMyPaths = processPaths(myPublicPaths);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Explore Knowledge Paths</h1>
                <p className="text-sm text-muted-foreground text-slate-600 dark:text-slate-400">
                    Discover learning journeys curated by scholars worldwide or manage your contributions.
                </p>
            </div>

            {/* Tabs & Toolbar */}
            <Tabs defaultValue="community" className="w-full space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <TabsList className="bg-slate-100 dark:bg-zinc-800/50 p-1 h-10 rounded-lg border border-slate-200 dark:border-zinc-700/50 shrink-0">
                        <TabsTrigger
                            value="community"
                            className="px-4 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 font-medium rounded-md transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <span>Community</span>
                                <span className="ml-1 text-xs opacity-70 bg-slate-200 dark:bg-zinc-700 px-1.5 rounded-full">
                                    {communityPaths.length}
                                </span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="my-contributions"
                            className="px-4 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 font-medium rounded-md transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <UserCircle className="w-4 h-4" />
                                <span>My Contributions</span>
                                <span className="ml-1 text-xs opacity-70 bg-slate-200 dark:bg-zinc-700 px-1.5 rounded-full">
                                    {myPublicPaths.length}
                                </span>
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Filters Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center bg-white dark:bg-zinc-900/50 p-3 rounded-lg border border-slate-200 dark:border-zinc-800/50 shadow-sm">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search paths..."
                            className="pl-9 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-slate-200 h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-[140px] h-9 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <Filter className="w-3.5 h-3.5" />
                                    <span className="truncate">{categoryFilter === "All" ? "Category" : categoryFilter}</span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {allCategories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                            <SelectTrigger className="w-full sm:w-[140px] h-9 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <Compass className="w-3.5 h-3.5" />
                                    <span>{difficultyFilter === "All" ? "Difficulty" : difficultyFilter}</span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Levels</SelectItem>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-[140px] h-9 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <ArrowUpDown className="w-3.5 h-3.5" />
                                    <span>{sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "Resources"}</span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="most_resources">Most Resources</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <TabsContent value="community" className="animate-in fade-in slide-in-from-bottom-2 duration-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    {filteredCommunityPaths.length === 0 ? (
                        <div className="py-20 px-4 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-zinc-900/50">
                            <div className="h-12 w-12 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <Compass className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                No paths found
                            </h3>
                            <p className="max-w-sm mx-auto text-sm text-slate-500 dark:text-slate-400">
                                Try adjusting your filters or search terms to find what you're looking for.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-12">
                            {filteredCommunityPaths.map((path) => (
                                <ExploreCard
                                    key={path.id}
                                    path={path}
                                    hasPath={false}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="my-contributions" className="animate-in fade-in slide-in-from-bottom-2 duration-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    {filteredMyPaths.length === 0 ? (
                        <div className="py-20 px-4 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-zinc-900/50">
                            <div className="h-12 w-12 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <LayoutGrid className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                No contributions found
                            </h3>
                            <p className="max-w-sm mx-auto text-sm text-slate-500 dark:text-slate-400">
                                Share your expertise by making a learning path public from your dashboard.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-12">
                            {filteredMyPaths.map((path) => (
                                <ExploreCard
                                    key={path.id}
                                    path={path}
                                    hasPath={true}
                                    isOwner={true}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
