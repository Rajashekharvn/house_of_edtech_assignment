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
    <section id="features" className="py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Everything you need completely
            <span className="text-gradient-premium block mt-2">Reimagined.</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            A powerful suite of tools designed to help you learn faster, retain more, and master complex topics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="bento-card group flex flex-col justify-between"
            >
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg">
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">
                  {f.title}
                </h3>
                <p className="text-slate-400 leading-relaxed font-light">
                  {f.description}
                </p>
              </div>

              {/* Decorative gradient blob for effect */}
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full group-hover:bg-indigo-500/30 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
