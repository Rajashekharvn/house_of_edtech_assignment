"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Book } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Hero() {
    return (
        <section className="pt-14 pb-32 px-4 text-center relative max-w-5xl mx-auto">
            <div className="flex justify-center mb-10">
                <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-slate-600 hover:bg-slate-200 transition-colors gap-2 font-medium">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="text-xs font-semibold">v2.0 Now Available</span>
                </Badge>
            </div>

            <div className="space-y-8">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                    Master any skill with <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        AI-Powered Focus.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-500 max-w-lg mx-auto leading-[1.8] font-normal tracking-tight">
                    Stop drowning in endless tutorials. <span className="text-indigo-600 font-semibold whitespace-nowrap">MindSprout</span> structures your self-study journey with AI-curated paths, smart summaries, and adaptive quizzes.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-10">
                    <Link href="/sign-up" className="relative group">
                        {/* Antigravity floating book effect */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 0, rotate: 0 }}
                            whileHover={{
                                opacity: 0.4,
                                scale: 1.2,
                                y: -40,
                                rotate: -15,
                                filter: "blur(2px)"
                            }}
                            className="absolute -top-4 -right-4 text-indigo-400 pointer-events-none z-0"
                        >
                            <Book className="w-12 h-12" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 0, rotate: 0 }}
                            whileHover={{
                                opacity: 0.3,
                                scale: 1,
                                y: -20,
                                rotate: 10,
                                filter: "blur(1px)"
                            }}
                            className="absolute -top-2 -left-4 text-purple-400 pointer-events-none z-0"
                        >
                            <Book className="w-8 h-8" />
                        </motion.div>

                        <Button size="lg" className="relative z-10 h-14 px-10 text-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-full shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95">
                            Start Learning Free
                        </Button>
                    </Link>
                    <Link href="#features">
                        <Button variant="outline" size="lg" className="h-14 px-10 text-lg font-medium text-slate-600 hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-50 rounded-full transition-all">
                            Explore Features
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
