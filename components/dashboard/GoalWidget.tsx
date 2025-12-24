"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Flame, CheckCircle2, Circle, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { addGoal } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface Goal {
    id: string;
    title: string;
    target: number;
    progress: number;
    type: string; // DAILY | WEEKLY
    metric: string; // RESOURCES | QUIZZES
    isCompleted: boolean;
}

interface GoalWidgetProps {
    goals: Goal[];
    streakCount: number;
}

export function GoalWidget({ goals: initialGoals, streakCount }: GoalWidgetProps) {
    const [goals, setGoals] = useState(initialGoals);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // New Goal Form State
    const [newTitle, setNewTitle] = useState("");
    const [newTarget, setNewTarget] = useState("3");
    const [newType, setNewType] = useState("WEEKLY");
    const [newMetric, setNewMetric] = useState("RESOURCES");

    const router = useRouter();

    const handleCreateGoal = async () => {
        try {
            await addGoal({
                title: newTitle,
                target: parseInt(newTarget),
                type: newType,
                metric: newMetric
            });
            toast.success("Goal created!");
            setIsDialogOpen(false);
            setNewTitle("");
            router.refresh();
        } catch (error) {
            toast.error("Failed to create goal");
        }
    };

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:shadow-md transition-all">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Goals & Streak</CardTitle>
                        <CardDescription>Track your weekly targets</CardDescription>
                    </div>
                    <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-semibold border border-orange-100 dark:border-orange-900/20">
                        <Flame className="w-4 h-4 fill-current" />
                        <span>{streakCount} Days</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 pt-6">
                {goals.length === 0 ? (
                    <div className="text-center py-8 flex flex-col items-center justify-center space-y-3">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full">
                            <Trophy className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <div>
                            <p className="text-slate-700 dark:text-slate-200 font-medium">No active goals</p>
                            <p className="text-xs text-slate-500 max-w-[200px] mx-auto mt-1">Create a goal to stay focused on your learning path.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="mt-2 text-indigo-600 border-indigo-100 hover:bg-indigo-50">Set Goal</Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {goals.map(goal => (
                            <div key={goal.id} className="group">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className={`font-medium flex items-center gap-2 ${goal.isCompleted ? 'text-slate-400 line-through decoration-2' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {goal.isCompleted ?
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                                            <Circle className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        }
                                        {goal.title}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                        {goal.progress}/{goal.target} {goal.metric === "RESOURCES" ? "Res." : "Quiz"}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${goal.isCompleted
                                            ? 'bg-emerald-500'
                                            : 'bg-indigo-500'
                                            }`}
                                        style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full gap-2 mt-4" variant="outline" onClick={() => setIsDialogOpen(true)}>
                            <Plus className="w-4 h-4" /> Add Goal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Set a Learning Goal</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">I want to...</label>
                                <Input
                                    placeholder="e.g. Master React Basics"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={newTarget}
                                        onChange={(e) => setNewTarget(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Metric</label>
                                    {/* Simplified select for now */}
                                    <Select value={newMetric} onValueChange={setNewMetric}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="RESOURCES">Resources</SelectItem>
                                            <SelectItem value="QUIZZES">Quizzes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateGoal} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Goal</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
