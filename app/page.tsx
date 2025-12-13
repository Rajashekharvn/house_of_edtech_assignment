import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Rocket, Target } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between bg-white border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <BrainCircuit className="w-8 h-8" />
          MindSprout
        </div>
        <div className="flex gap-4">
          <Link href="/sign-in">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Master any skill with <span className="text-indigo-600">AI-Powered</span> Learning Paths.
          </h1>
          <p className="text-lg text-slate-600">
            Structure your self-study journey. Create paths, curate resources, and let AI summarize content and generate quizzes for you.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8 text-lg gap-2">
                Start Learning Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full px-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border text-left">
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl mb-2">Structured Paths</h3>
            <p className="text-slate-600">Organize scattered tutorials and docs into cohesive learning journeys.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-left">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl mb-2">AI Summaries</h3>
            <p className="text-slate-600">Get instant AI-generated summaries for long articles and videos.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-left">
            <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 text-pink-600">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl mb-2">Progress Tracking</h3>
            <p className="text-slate-600">Track your completion status and visualize your growth over time.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white border-t text-center text-slate-500 text-sm">
        <p>© 2025 MindSprout. Built for House of Edtech Assignment.</p>
      </footer>
    </div>
  );
}
