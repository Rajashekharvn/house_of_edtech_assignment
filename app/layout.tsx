import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "House of EdTech",
  description: "Master any skill with AI-Powered Learning Paths.",
};

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="fixed inset-0 z-[-1] bg-grid opacity-30 dark:opacity-20 pointer-events-none" />
          <div className="fixed inset-0 z-[-1] bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <KeyboardShortcutsProvider />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
