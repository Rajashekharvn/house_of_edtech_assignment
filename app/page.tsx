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
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 bg-black bg-grid pointer-events-none overflow-hidden" />

      {/* Fixed Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="relative z-10">
        <Hero />
        <Features />
        <Footer />
      </main>
    </>
  );
}
