import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";
import { Header } from "@/components/Header";
import { redirect, notFound } from "next/navigation";
import { AddResourceDialog } from "@/components/AddResourceDialog";
import { ResourceCard } from "@/components/ResourceCard";
import { PathHero } from "@/components/PathHero";
import { QuizDialog } from "@/components/QuizDialog";
import { QuizHistory } from "@/components/QuizHistory";
import { GraduationCap, Layout, BarChart3, LockKeyhole } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = 'force-dynamic';

export default async function PathDetailPage({ params }: { params: Promise<{ pathId: string }> }) {
    const user = await checkUser();
    if (!user) return redirect("/sign-in");

    const { pathId } = await params;

    const path = await db.learningPath.findUnique({
        where: {
            id: pathId,
            userId: user.id,
        },
        include: {
            quiz: true,
            flashcards: true,
            resources: {
                orderBy: {
                    createdAt: "desc",
                }
            },
        },
    });

    if (!path) {
        return notFound();
    }
    const totalResources = path.resources.length;
    const completedResources = path.resources.filter(r => r.isCompleted).length;
    const completionPercentage = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;
    const isFullyCompleted = completionPercentage === 100;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background transition-colors duration-300">
            <Header />
            <main id="learning-path-content" className="container mx-auto px-4 py-8 max-w-7xl">

                {/* 1. New Hero Component */}
                <PathHero path={path} backLink="/dashboard" />

                {/* 2. Tabbed Interface */}
                <Tabs defaultValue="curriculum" className="space-y-8">
                    <TabsList className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-slate-200 dark:border-zinc-800 p-1 rounded-xl h-auto w-full md:w-fit grid grid-cols-2 md:inline-flex no-export">
                        <TabsTrigger value="curriculum" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
                            <Layout className="w-4 h-4" /> Curriculum
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
                            <BarChart3 className="w-4 h-4" /> Performance
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB: Curriculum (Resources) */}
                    <TabsContent value="curriculum" className="space-y-8 focus-visible:outline-none focus-visible:ring-0">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Main Feed */}
                            <div className="flex-1 w-full space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Learning Modules</h2>
                                    <div className="no-export"><AddResourceDialog pathId={path.id} /></div>
                                </div>

                                <div className="space-y-6">
                                    {path.resources.length === 0 ? (
                                        <div className="p-12 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-center bg-white/50 dark:bg-zinc-900/30">
                                            <div className="max-w-md mx-auto space-y-2">
                                                <h3 className="text-lg font-medium text-slate-900 dark:text-foreground">Start your journey</h3>
                                                <p className="text-slate-500 dark:text-muted-foreground">Add your first resource to build this path.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        path.resources.map((resource, index) => (
                                            <div key={resource.id} className="relative pl-8 md:pl-0 group printable-module">
                                                {/* Connecting Line (Desktop) */}
                                                {index !== path.resources.length - 1 && (
                                                    <div className="hidden md:block absolute left-8 top-16 bottom-0 w-0.5 bg-slate-200 dark:bg-zinc-800 -z-10 group-last:hidden" />
                                                )}

                                                <div className="md:pl-16 relative">
                                                    {/* Number Badge */}
                                                    <div className={`absolute left-0 top-6 hidden md:flex w-10 h-10 rounded-full items-center justify-center font-bold text-sm border-4 border-slate-50 dark:border-black z-10 transition-colors ${resource.isCompleted
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-white dark:bg-zinc-800 text-slate-400 border-slate-100 dark:border-zinc-700'}`}>
                                                        {index + 1}
                                                    </div>
                                                    <ResourceCard resource={resource} />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Sidebar: Mastery Challenge */}
                            <div className="w-full md:w-80 lg:w-96 shrink-0 space-y-6 no-export">
                                <div className="sticky top-24">
                                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 shadow-xl ring-1 ring-white/10">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />

                                        <div className="relative space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                                                    <GraduationCap className="w-6 h-6 text-indigo-300" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">Mastery Quiz</h3>
                                                    <p className="text-xs text-slate-400">Final Assessment</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span className="text-slate-300">Unlock Progress</span>
                                                    <span>{completionPercentage}%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
                                                </div>
                                            </div>

                                            {isFullyCompleted ? (
                                                <div className="pt-2 no-export">
                                                    <QuizDialog pathId={path.id} existingQuiz={path.quiz} />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-xs text-slate-400 bg-black/20 p-3 rounded-lg border border-white/5">
                                                    <LockKeyhole className="w-3.5 h-3.5" />
                                                    <span>Complete all modules to unlock</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB: Performance (Analytics) */}
                    <TabsContent value="performance" className="focus-visible:outline-none focus-visible:ring-0">
                        {path.resources.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                                <QuizHistory pathId={path.id} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200">
                                <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No Data Yet</h3>
                                <p>Complete resources and take quizzes to see your performance metrics here.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
