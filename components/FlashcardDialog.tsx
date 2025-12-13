"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Layers, Sparkles, Loader2, ArrowRight, ArrowLeft,
    CheckCircle2, Shuffle, Trophy, Keyboard, Check, X
} from "lucide-react";
import { generateFlashcards, toggleFlashcardMastery } from "@/lib/ai-actions";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface Flashcard {
    id: string;
    front: string;
    back: string;
    isMastered: boolean;
}

interface FlashcardDialogProps {
    pathId: string;
    flashcards: Flashcard[];
}

export function FlashcardDialog({ pathId, flashcards }: FlashcardDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Matching Mode State
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    // Local state to track mastery updates immediately
    const [localCards, setLocalCards] = useState<Flashcard[]>(flashcards);

    // Derived state
    const totalCards = localCards.length;
    const masteredCount = localCards.filter(c => c.isMastered).length;
    const progress = totalCards > 0 ? (masteredCount / totalCards) * 100 : 0;

    // Effect for celebration
    useEffect(() => {
        if (isOpen && masteredCount === totalCards && totalCards > 0) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#8b5cf6', '#d946ef']
            });
        }
    }, [masteredCount, totalCards, isOpen]);

    // Generate Options when card changes
    useEffect(() => {
        if (!isOpen || localCards.length === 0) return;

        const currentCard = localCards[currentIndex];

        // Gather distractors (other fronts)
        const otherCards = localCards.filter(c => c.id !== currentCard.id);
        const distractors = otherCards
            .map(c => c.front)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        // Use fallbacks if not enough cards
        if (distractors.length < 3) {
            const fillers = ["None of the above", "Variable", "Function", "Array"];
            while (distractors.length < 3) {
                distractors.push(fillers[distractors.length]);
            }
        }

        // Combine and shuffle
        const allOptions = [...distractors, currentCard.front]
            .sort(() => 0.5 - Math.random());

        setOptions(allOptions);
        setSelectedOption(null);
        setIsCorrect(null);
        setIsFlipped(false); // Reset flip state
    }, [currentIndex, localCards, isOpen]);


    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            await generateFlashcards(pathId);
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Failed to generate flashcards");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = async (option: string) => {
        if (selectedOption) return; // Prevent double guess

        setSelectedOption(option);
        const currentCard = localCards[currentIndex];
        const correct = option === currentCard.front;
        setIsCorrect(correct);

        if (correct) {
            // Correct!
            // 1. Reveal card (Flip)
            setTimeout(() => setIsFlipped(true), 200);

            // 2. Mark master if not already
            if (!currentCard.isMastered) {
                // Optimistic
                setLocalCards(prev => prev.map(c => c.id === currentCard.id ? { ...c, isMastered: true } : c));
                try {
                    await toggleFlashcardMastery(currentCard.id, true, pathId);
                } catch (e) { console.error(e); }
            }

            // 3. Auto advance
            setTimeout(() => {
                handleNext();
            }, 1500);
        } else {
            // Wrong!
            // Just show feedback, user must try Next manually or guess again (if we allowed multi-guess, but strict mode is better)
            // For now, let's reveal the correct one after a delay or let them suffer? 
            // Matching Quiz Style: Reveal correct answer
            setTimeout(() => setIsFlipped(true), 600);
        }
    };

    const handleNext = useCallback(() => {
        if (localCards.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % localCards.length);
        }, 150);
    }, [localCards.length]);

    const handlePrev = useCallback(() => {
        if (localCards.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(prev => (prev - 1 + localCards.length) % localCards.length);
        }, 150);
    }, [localCards.length]);

    const handleShuffle = () => {
        setIsFlipped(false);
        setLocalCards(prev => {
            const shuffled = [...prev];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        });
        setCurrentIndex(0);
    };

    if (localCards.length === 0) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-indigo-600 border-indigo-200">
                        <Layers className="w-4 h-4" /> Flashcards
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center">Generate Flashcards</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                            <Layers className="w-12 h-12 text-indigo-500" />
                        </div>
                        <p className="text-center text-slate-600 dark:text-slate-400 max-w-sm">
                            Generate study flashcards from the key concepts in this resource.
                        </p>
                        <Button onClick={handleGenerate} disabled={isLoading} className="gap-2">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {isLoading ? "Generating..." : "Generate Cards"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const currentCard = localCards[currentIndex];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/20">
                    <Layers className="w-4 h-4" /> Study Cards
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl flex flex-col h-[700px] gap-0 p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-500" />
                            <span>Matching Quiz</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                                onClick={handleShuffle}
                                title="Shuffle Deck"
                            >
                                <Shuffle className="w-4 h-4" />
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
                            <span>{masteredCount} of {totalCards} Mastered</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Card Containter (Reduced height for options) */}
                    <div className="h-[240px] perspective-1000 relative shrink-0">
                        {masteredCount === totalCards && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                                <span className="text-3xl">🎉</span>
                            </div>
                        )}

                        <div
                            className={cn(
                                "relative w-full h-full transition-all duration-500 preserve-3d cursor-default",
                                isFlipped ? "rotate-y-180" : ""
                            )}
                        >
                            {/* Front (Actually Back/Definition now) */}
                            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 text-center ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-4">Definition</span>
                                <p className="text-xl md:text-2xl font-medium leading-relaxed">
                                    {currentCard.back}
                                </p>
                                <p className="absolute bottom-4 text-xs text-indigo-200 opacity-70">
                                    Select the matching term below
                                </p>
                            </div>

                            {/* Back (Actually Front/Term) - Revealed on Correct */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 text-center">
                                {isCorrect === true && (
                                    <div className="absolute top-4 text-green-500 bg-green-50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                        <Check className="w-4 h-4" /> Correct!
                                    </div>
                                )}
                                {isCorrect === false && (
                                    <div className="absolute top-4 text-red-500 bg-red-50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                        <X className="w-4 h-4" /> Incorrect
                                    </div>
                                )}

                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Correct Term</span>
                                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                                    {currentCard.front}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                        {options.map((option, idx) => {
                            const isSelected = selectedOption === option;
                            const isCorrectAnswer = option === currentCard.front;

                            let variantStyles = "hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800";

                            if (selectedOption) {
                                if (isSelected && isCorrectAnswer) {
                                    variantStyles = "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-300";
                                } else if (isSelected && !isCorrectAnswer) {
                                    variantStyles = "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300";
                                } else if (isCorrectAnswer) {
                                    variantStyles = "border-green-500 bg-green-50 opacity-100 dark:bg-green-900/10"; // Show correct one if wrong
                                } else {
                                    variantStyles = "opacity-50 grayscale";
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={selectedOption !== null}
                                    className={cn(
                                        "p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-left transition-all duration-200 flex items-center gap-3 relative",
                                        variantStyles
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-md border flex items-center justify-center text-xs font-bold",
                                        isSelected || (selectedOption && isCorrectAnswer) ? "border-current" : "border-slate-300 text-slate-400"
                                    )}>
                                        {['A', 'B', 'C', 'D'][idx]}
                                    </div>
                                    <span className="truncate">{option}</span>

                                    {selectedOption && isCorrectAnswer && option === currentCard.front && (
                                        <CheckCircle2 className="w-5 h-5 ml-auto text-green-600" />
                                    )}
                                    {isSelected && !isCorrectAnswer && (
                                        <X className="w-5 h-5 ml-auto text-red-600" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
