"use client";

import { BrainCircuit, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Structured Paths",
    description:
      "AI-built learning roadmaps that remove guesswork and save time.",
    icon: BrainCircuit,
  },
  {
    title: "Adaptive Quizzes",
    description:
      "Smart assessments that evolve as you learn and improve retention.",
    icon: Target,
  },
  {
    title: "Instant Summaries",
    description:
      "Turn long articles and videos into concise, actionable insights.",
    icon: Zap,
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-transparent">
      <div className="mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <Badge className="mb-4 bg-indigo-100 text-indigo-600">
            Core Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Built for modern learners
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Everything you need to learn deeply — without distractions.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md p-10 border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-xl transition"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{f.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
