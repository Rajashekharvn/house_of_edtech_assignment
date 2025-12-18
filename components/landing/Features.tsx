"use client";

import { BrainCircuit, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
    {
        title: "Structured Paths",
        description: "AI-curated roadmaps that turn scattered resources into a logical learning sequence.",
        icon: BrainCircuit,
    },
    {
        title: "Adaptive Quizzes",
        description: "Dynamic knowledge checks that evolve based on your performance and resource content.",
        icon: Target,
    },
    {
        title: "Smart Summaries",
        description: "Extract core concepts from any documentation or video in seconds.",
        icon: Zap,
    },
];

export function Features() {
    return (
        <section id="features" className="py-32 px-4 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <Badge variant="secondary" className="mb-6 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-semibold tracking-wide text-[10px] uppercase">
                        Core Features
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                        Designed for the <span className="italic font-serif">modern</span> learner.
                    </h2>
                    <p className="text-lg text-slate-500 leading-relaxed max-w-lg mx-auto">
                        Everything you need to master any subject, organized in a clean, professional workspace.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="group p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center h-full">
                            <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3
                ${index === 0 ? 'bg-indigo-50 text-indigo-600' :
                                    index === 1 ? 'bg-purple-50 text-purple-600' :
                                        'bg-pink-50 text-pink-600'}`}>
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-normal">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

