"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";

export function Navbar() {
    return (
        <header className="px-6 h-16 flex items-center justify-between border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                <span className="text-slate-900">MindSprout</span>
            </div>
            <div className="flex items-center gap-8">
                <Link href="/sign-in" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                    Log in
                </Link>
                <Link href="/sign-up">
                    <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-full px-5">
                        Get Started
                    </Button>
                </Link>
            </div>
        </header>
    );
}
