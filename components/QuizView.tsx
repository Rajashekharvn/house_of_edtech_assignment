"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit, CheckCircle, XCircle, Loader2, Trophy, ArrowRight, Sparkles, AlertCircle, RefreshCw, ChevronLeft } from "lucide-react";
import { generateQuiz } from "@/lib/ai-actions";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { showToast } from "@/lib/toast";
import { saveQuizAttempt } from "@/lib/quiz-actions";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Question {
    question: string;
    options: string[];
    answer: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    sourceResourceTitle?: string;
}

interface QuizViewProps {
    pathId: string;
    existingQuiz?: {
        id: string;
        questions: any;
    } | null;
}

export function QuizView({ pathId, existingQuiz }: QuizViewProps) {
    const router = useRouter();
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

    // 1. Generate State
    if (!quizData) {
        return (
            <div className="w-full max-w-2xl mx-auto py-12 px-4">
                <div className="flex flex-col items-center justify-center space-y-8 bg-white dark:bg-zinc-900/50 p-12 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm text-center">
                    <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                        <Sparkles className="w-12 h-12 text-indigo-500" />
                    </div>
                    <div className="max-w-md space-y-3">
                        <h3 className="font-bold text-2xl text-slate-900 dark:text-slate-100">Ready for the Challenge?</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Generate a comprehensive 10-question AI quiz to master this topic.
                        </p>
                    </div>
                    <Button onClick={handleGenerate} disabled={isLoading} size="lg" className="w-full max-w-sm gap-2 h-12 text-base bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                        {isLoading ? "Designing Quiz..." : "Generate Quiz"}
                    </Button>
                    <Link href={`/dashboard/paths/${pathId}`} className="text-sm font-medium text-slate-400 hover:text-slate-600">
                        Cancel and Go Back
                    </Link>
                </div>
            </div>
        );
    }

    // 2. Result State
    if (showResult) {
        return (
            <div className="w-full max-w-md mx-auto py-12 px-4">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-8 text-center">
                    <div className="relative inline-block">
                        <Trophy className={`w-28 h-28 mx-auto ${score >= 7 ? 'text-yellow-500' : 'text-slate-300'} drop-shadow-lg`} />
                        {score === quizData.length && (
                            <Sparkles className="w-10 h-10 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="text-6xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tighter">
                            {score} <span className="text-3xl text-slate-400 font-normal">/ {quizData.length}</span>
                        </div>
                        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                            {score === quizData.length ? "Perfect Score! 🌟" : score >= 7 ? "Great job! Mastered. 👍" : "Good effort! Keep learning. 📚"}
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 flex justify-between items-center text-sm font-medium">
                        <span className="text-slate-500">Accuracy</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">{Math.round((score / quizData.length) * 100)}%</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={resetQuiz} className="flex-1 h-11 border-slate-200 dark:border-zinc-700">Retry Quiz</Button>
                            <Button variant="outline" onClick={handleRegenerate} className="flex-1 h-11 gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400">
                                <RefreshCw className="w-4 h-4" /> New Questions
                            </Button>
                        </div>
                        <Link href={`/dashboard/paths/${pathId}`}>
                            <Button className="w-full h-11" variant="ghost">Back to Path</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Quiz State
    const currentQuestion = quizData[currentIndex];
    const progress = ((currentIndex + 1) / quizData.length) * 100;

    return (
        <div className="w-full max-w-3xl mx-auto py-4 px-4 md:px-6 h-full flex flex-col">
            <div className="mb-4 flex items-center justify-between shrink-0">
                <Link href={`/dashboard/paths/${pathId}`} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back to path
                </Link>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Final Assessment</div>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col flex-1">
                {/* Header with Progress */}
                <div className="bg-slate-50/50 dark:bg-zinc-900/50 p-4 md:p-6 border-b border-slate-100 dark:border-zinc-800 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question {currentIndex + 1} of {quizData.length}</span>
                        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/10 px-2.5 py-1 rounded-full border border-yellow-100 dark:border-yellow-900/20">
                            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">{score}</span>
                        </div>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-100 dark:bg-zinc-800" />
                </div>

                <div className="p-4 md:p-6 flex flex-col flex-1 overflow-y-auto">
                    {/* Question Area */}
                    <div className="space-y-4 mb-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <h3 className="text-lg md:text-xl font-bold leading-tight text-slate-900 dark:text-slate-100">
                                {currentQuestion.question}
                            </h3>
                            {currentQuestion.difficulty && (
                                <span className={cn(
                                    "shrink-0 self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
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
                            <div className="inline-flex items-center gap-2 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg">
                                <AlertCircle className="w-3 h-3" />
                                <span className="truncate max-w-[300px]">Source: {currentQuestion.sourceResourceTitle}</span>
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
                                    "relative w-full text-left p-3 pl-12 rounded-xl border-2 transition-all duration-200 group text-sm md:text-base",
                                    isAnswered && idx === currentQuestion.answer
                                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm"
                                        : isAnswered && idx === selectedOption && idx !== currentQuestion.answer
                                            ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 opacity-70"
                                            : "border-slate-100 dark:border-zinc-800 hover:border-indigo-500/30 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                )}
                            >
                                <span className={cn(
                                    "absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                                    isAnswered && idx === currentQuestion.answer ? "border-green-600 bg-green-500 text-white" :
                                        isAnswered && idx === selectedOption ? "border-red-500 bg-red-500 text-white" :
                                            "border-slate-300 text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-500"
                                )}>
                                    {['A', 'B', 'C', 'D'][idx]}
                                </span>
                                <span className="font-medium leading-snug">{option}</span>

                                {isAnswered && idx === currentQuestion.answer && (
                                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 animate-in zoom-in spin-in-45 duration-300" />
                                )}
                                {isAnswered && idx === selectedOption && idx !== currentQuestion.answer && (
                                    <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600 animate-in zoom-in duration-300" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Footer - Pushed to bottom if space allows, or just below content */}
                    <div className="mt-auto pt-4 flex justify-between items-center h-12 shrink-0">
                        <div className="text-xs font-medium text-slate-400 italic">
                            {isAnswered ? (currentIndex === quizData.length - 1 ? "Quiz Completed" : "Question Answered") : "Select an option"}
                        </div>
                        {isAnswered && (
                            <Button onClick={handleNext} size="sm" className="pl-4 pr-3 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/20 animate-in slide-in-from-right-4 fade-in duration-300">
                                {currentIndex === quizData.length - 1 ? "Finish" : "Next"}
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
