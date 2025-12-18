"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-0 pb-40 px-6 text-center">
      <div className="mx-auto max-w-5xl">
        <Badge className="mb-8 rounded-full px-4 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600">
          v2.0 is live
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white">
          Learn faster with
          <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI-guided focus
          </span>
        </h1>

        <p className="mt-6 mx-auto max-w-xl text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          MindSprout transforms scattered tutorials into structured learning
          paths, summaries, and adaptive practice.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-14 px-10 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg"
            >
              Start Learning Free
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-10 rounded-full dark:bg-zinc-900/50 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              Explore Features
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
