"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
    return (
        <section className="py-32 px-4 text-center">
            <div className="max-w-4xl mx-auto py-28 px-8 bg-indigo-600 rounded-[4rem] shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                {/* Subtle decorative circle */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50" />

                <div className="relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Ready to upgrade your brain?
                    </h2>
                    <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto px-4">
                        Join thousands of learners mastering skills faster with MindSprout's AI-powered ecosystem.
                    </p>
                    <Link href="/sign-up">
                        <Button size="lg" variant="secondary" className="h-14 px-12 text-lg font-bold bg-white text-indigo-600 hover:bg-slate-50 rounded-full transition-all hover:scale-105">
                            Get Started for Free
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
