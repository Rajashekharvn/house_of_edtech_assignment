import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <>
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-100 dark:opacity-40 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Fixed Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="relative z-10 pt-16">
        <Hero />
        <Features />
        <Footer />
      </main>
    </>
  );
}
