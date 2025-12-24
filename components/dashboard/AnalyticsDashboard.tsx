"use client";

import { useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsDashboardProps {
    quizAttempts: Array<{
        id: string;
        score: number;
        totalQuestions: number;
        createdAt: Date;
        quiz: { path: { title: string } };
    }>;
    completedResources: Array<{
        id: string;
        updatedAt: Date;
        path: { title: string; category: string | null };
    }>;
}

export function AnalyticsDashboard({ quizAttempts, completedResources }: AnalyticsDashboardProps) {

    // 1. Quiz Performance Over Time
    const quizPerformanceData = useMemo(() => {
        // Group by Date for simplicity, or just map
        return quizAttempts
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map(attempt => ({
                date: new Date(attempt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                score: Math.round((attempt.score / attempt.totalQuestions) * 100),
                path: attempt.quiz.path.title
            }))
            .slice(-10); // Last 10 attempts
    }, [quizAttempts]);

    // 2. Completion Activity (Last 7 days)
    const activityData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString(undefined, { weekday: 'short' });
        }).reverse();

        const counts: Record<string, number> = {};
        completedResources.forEach(r => {
            const day = new Date(r.updatedAt).toLocaleDateString(undefined, { weekday: 'short' });
            counts[day] = (counts[day] || 0) + 1;
        });

        return last7Days.map(day => ({
            day,
            completed: counts[day] || 0
        }));
    }, [completedResources]);

    // 3. Category Distribution
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        completedResources.forEach(r => {
            const cat = r.path.category || "Uncategorized";
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [completedResources]);

    const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats moved to AnalyticsStats component */}

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full md:w-auto grid grid-cols-2 md:inline-flex">
                    <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="performance" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Quiz Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        {/* Weekly Activity */}
                        <Card className="col-span-4 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="text-lg">Weekly Activity</CardTitle>
                                <CardDescription>Resources completed over the last 7 days</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-0 pr-6 pb-4">
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={activityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                        <XAxis
                                            dataKey="day"
                                            stroke="#64748B"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="#64748B"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F1F5F9', opacity: 0.4 }}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', padding: '8px', fontSize: '12px' }}
                                        />
                                        <Bar dataKey="completed" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Category Distribution */}
                        <Card className="col-span-3 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Learning Focus</CardTitle>
                                <CardDescription className="text-xs">Distribution by category</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                            cornerRadius={4}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', padding: '8px', fontSize: '12px' }} />
                                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="animate-in fade-in zoom-in-95 duration-300">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="text-base">Quiz Scores Pattern</CardTitle>
                            <CardDescription className="text-xs">Your last 10 quiz attempts</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={quizPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', padding: '8px', fontSize: '12px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#4f46e5"
                                        strokeWidth={2.5}
                                        dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
