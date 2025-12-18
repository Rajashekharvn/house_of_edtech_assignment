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
        ${scrolled ? "glass-nav" : "bg-transparent"}`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 font-bold tracking-tight">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl text-white">MindSprout</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-8">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
          >
            Log in
          </Link>
          <Link href="/sign-up">
            <Button className="h-10 rounded-full px-6 bg-white text-black hover:bg-slate-200 font-semibold transition-all hover:scale-105 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
