import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

import { db } from "@/lib/db";
import { PopularPaths } from "@/components/landing/PopularPaths";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  // Fetch Popular Paths (Dynamic Content)
  const popularPaths = await db.learningPath.findMany({
    where: {
      isPublic: true,
    },
    take: 3,
    orderBy: {
      stars: {
        _count: 'desc'
      }
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      difficulty: true,
      _count: {
        select: {
          resources: true,
          stars: true
        }
      },
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return (
    <>
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 bg-white dark:bg-[#0C0D0D] bg-grid pointer-events-none overflow-hidden" />

      {/* Fixed Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="relative z-10">
        <Hero />
        <Features />
        <PopularPaths paths={popularPaths as any} />
        <Footer />
      </main>
    </>
  );
}
