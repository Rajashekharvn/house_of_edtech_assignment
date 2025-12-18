"use client";

import { BrainCircuit } from "lucide-react";

export function Footer() {
    return (
        <footer className="py-12 border-t border-slate-100 bg-white text-center text-slate-400 text-sm">
            <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                <span className="font-bold tracking-widest text-slate-900">MINDSPROUT</span>
            </div>
            <p>© 2025 MindSprout. Built for House of Edtech Assignment.</p>
        </footer>
    );
}
