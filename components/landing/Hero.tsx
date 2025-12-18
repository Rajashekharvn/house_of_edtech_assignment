"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-0 pb-32 px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center relative z-10 font-sans">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-300 mb-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          v2.0 is live
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[1.1]">
          Learn faster with
          <span className="block mt-2 text-gradient-gold">
            AI-Powered Mastery
          </span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed font-light">
          MindSprout transforms scattered tutorials into structured learning
          paths, summaries, and adaptive practice. Rise above the noise.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-14 px-8 rounded-full bg-white text-black hover:bg-slate-200 text-lg font-semibold transition-all hover:scale-105 shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]"
            >
              Start Learning Free
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-lg backdrop-blur-md transition-all hover:scale-105"
            >
              Explore Features
            </Button>
          </Link>
        </div>
      </div>

      {/* Subtle Background Glow - Removed for "Full Dark" request */}
      {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" /> */}

      {/* Hero Grid Overlay - Removed to use global page background */}
    </section>
  );
}
