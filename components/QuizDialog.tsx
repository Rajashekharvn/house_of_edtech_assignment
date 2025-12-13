"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BrainCircuit, CheckCircle, XCircle, Loader2, Trophy, ArrowRight, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { generateQuiz } from "@/lib/ai-actions";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { showToast } from "@/lib/toast";
import { saveQuizAttempt } from "@/lib/quiz-actions";
import { Progress } from "@/components/ui/progress";

interface Question {
    question: string;
    options: string[];
    answer: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    sourceResourceTitle?: string;
}

interface QuizDialogProps {
    pathId: string;
    existingQuiz?: {
        id: string;
        questions: any; // Prism JSON type is tricky, using any for flexibility
    } | null;
}

export function QuizDialog({ pathId, existingQuiz }: QuizDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [quizData, setQuizData] = useState<Question[] | null>(
        existingQuiz ? (existingQuiz.questions as unknown as Question[]) : null
    );

    // Quiz State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            await generateQuiz(pathId);
            showToast.success("Quiz generated successfully!");
            window.location.reload();
        } catch (error) {
            console.error(error);
            showToast.error("Failed to generate quiz. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = async () => {
        setQuizData(null);
        setIsLoading(true);
        try {
            await generateQuiz(pathId, true);
            showToast.success("New questions generated!");
            window.location.reload();
        } catch (error) {
            console.error(error);
            showToast.error("Failed to generate new quiz.");
            setIsLoading(false);
        }
    };

    const handleAnswer = (optionIndex: number) => {
        if (isAnswered) return;
        setSelectedOption(optionIndex);
        setIsAnswered(true);

        if (optionIndex === quizData![currentIndex].answer) {
            setScore(s => s + 1);
            if (currentIndex === quizData!.length - 1) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }
    };

    const handleFinish = async () => {
        setIsSaving(true);
        try {
            // existingQuiz is guaranteed if quizData is present (except if we just generated without reload, but we reload)
            if (existingQuiz?.id) {
                await saveQuizAttempt(existingQuiz.id, score, quizData!.length);
                showToast.success("Result saved to history!");
            }
        } catch (error) {
            console.error(error);
            showToast.error("Failed to save result.");
        } finally {
            setIsSaving(false);
            setShowResult(true);
        }
    };

    const handleNext = () => {
        if (currentIndex < quizData!.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            handleFinish();
        }
    };

    const resetQuiz = () => {
        setCurrentIndex(0);
        setScore(0);
        setShowResult(false);
        setSelectedOption(null);
        setIsAnswered(false);
    };

    if (!quizData) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-indigo-600 border-indigo-200">
                        <BrainCircuit className="w-4 h-4" /> Quiz Me
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate AI Quiz</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-8 space-y-6">
                        <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full animate-pulse">
                            <Sparkles className="w-12 h-12 text-indigo-500" />
                        </div>
                        <div className="text-center max-w-sm space-y-2">
                            <h3 className="font-semibold text-lg">Knowledge Check</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Generate a comprehensive 10-question quiz covering all resources in this topic.
                            </p>
                        </div>
                        <Button onClick={handleGenerate} disabled={isLoading} className="w-full max-w-xs gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                            {isLoading ? "Designing Quiz..." : "Generate Quiz"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Result View
    if (showResult) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-indigo-600 border-indigo-200">
                        Take Quiz
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">Quiz Results</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-6 space-y-6">
                        <div className="relative">
                            <Trophy className={`w-24 h-24 ${score >= 7 ? 'text-yellow-500' : 'text-slate-300'} drop-shadow-md`} />
                            {score === quizData.length && (
                                <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
                            )}
                        </div>

                        <div className="text-center space-y-2">
                            <div className="text-5xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">
                                {score} <span className="text-2xl text-slate-400 font-normal">/ {quizData.length}</span>
                            </div>
                            <p className="text-slate-500 font-medium">
                                {score === quizData.length ? "Perfect Score! 🌟" : score >= 7 ? "Great job! You've mastered this. 👍" : "Good effort! Review the material and try again. 📚"}
                            </p>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl p-4 flex justify-between items-center text-sm">
                            <span className="text-slate-500">Accuracy</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{Math.round((score / quizData.length) * 100)}%</span>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                            <div className="flex gap-3 w-full">
                                <Button variant="outline" onClick={resetQuiz} className="flex-1">Retry</Button>
                                <Button variant="outline" onClick={handleRegenerate} className="flex-1 gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400">
                                    <RefreshCw className="w-4 h-4" /> New Questions
                                </Button>
                            </div>
                            <Button onClick={() => setIsOpen(false)} className="w-full">Close</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Question View
    const currentQuestion = quizData[currentIndex];
    const progress = ((currentIndex + 1) / quizData.length) * 100;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/20">
                    <BrainCircuit className="w-4 h-4" /> Take Quiz
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0">
                <DialogTitle className="sr-only">Question {currentIndex + 1}</DialogTitle>
                {/* Header with Progress */}
                <div className="bg-slate-50 dark:bg-zinc-900/50 p-6 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Question {currentIndex + 1} of {quizData.length}</span>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{score}</span>
                        </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="p-6 space-y-6">
                    {/* Question Area */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="text-xl font-semibold leading-relaxed text-slate-900 dark:text-slate-100">
                                {currentQuestion.question}
                            </h3>
                            {currentQuestion.difficulty && (
                                <span className={cn(
                                    "shrink-0 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide",
                                    currentQuestion.difficulty === 'easy' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                    currentQuestion.difficulty === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                                    currentQuestion.difficulty === 'hard' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                )}>
                                    {currentQuestion.difficulty}
                                </span>
                            )}
                        </div>

                        {/* Source Hint */}
                        {currentQuestion.sourceResourceTitle && (
                            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg w-fit">
                                <AlertCircle className="w-3 h-3" />
                                <span className="truncate max-w-[200px]">Source: {currentQuestion.sourceResourceTitle}</span>
                            </div>
                        )}
                    </div>

                    {/* Options */}
                    <div className="grid gap-3">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={isAnswered}
                                className={cn(
                                    "relative w-full text-left p-4 pl-12 rounded-xl border-2 transition-all duration-200 group",
                                    isAnswered && idx === currentQuestion.answer
                                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-[0_0_0_1px_rgba(34,197,94,0.4)]"
                                        : isAnswered && idx === selectedOption && idx !== currentQuestion.answer
                                            ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                            : "border-slate-100 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                )}
                            >
                                <span className={cn(
                                    "absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors",
                                    isAnswered && idx === currentQuestion.answer ? "border-green-600 bg-green-500 text-white" :
                                        isAnswered && idx === selectedOption ? "border-red-500 bg-red-500 text-white" :
                                            "border-slate-300 text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-500"
                                )}>
                                    {['A', 'B', 'C', 'D'][idx]}
                                </span>
                                <span className="text-base font-medium">{option}</span>

                                {isAnswered && idx === currentQuestion.answer && (
                                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 animate-in zoom-in spin-in-45 duration-300" />
                                )}
                                {isAnswered && idx === selectedOption && idx !== currentQuestion.answer && (
                                    <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600 animate-in zoom-in duration-300" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-2 flex justify-between items-center h-10">
                        <div className="text-sm font-medium text-slate-400">
                            {isAnswered ? (currentIndex === quizData.length - 1 ? "Quiz Completed" : "Answered") : "Select an option"}
                        </div>
                        {isAnswered && (
                            <Button onClick={handleNext} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white animate-in slide-in-from-right-4 fade-in duration-300">
                                {currentIndex === quizData.length - 1 ? "Finish Quiz" : "Next Question"}
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

