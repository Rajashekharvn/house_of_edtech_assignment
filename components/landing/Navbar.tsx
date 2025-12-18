"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300
        ${scrolled
          ? "bg-white/40 backdrop-blur-xl shadow-sm border-b border-slate-200/50"
          : "bg-transparent"
        }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <BrainCircuit className="h-5 w-5 text-indigo-600" />
          <span className="text-slate-900 dark:text-white">MindSprout</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            Log in
          </Link>
          <Link href="/sign-up">
            <Button className="rounded-full px-6 bg-indigo-600 hover:bg-indigo-700">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
