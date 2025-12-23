"use client";

import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ShellLayoutProps {
    children: React.ReactNode;
    streakCount: number;
}

export function ShellLayout({ children, streakCount }: ShellLayoutProps) {
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);

    // Calculate content padding
    // Base: 80px (collapsed sidebar)
    // Hover: 256px (expanded sidebar)
    // When sidebar is hovered, we push content so it doesn't get covered (optional, but requested earlier).

    const contentPadding = isSidebarHovered ? "md:pl-64" : "md:pl-[80px]";

    return (
        <div className="h-full relative min-h-screen">
            {/* Sidebar with hoisted state control */}
            <div className="hidden md:block">
                <Sidebar
                    streakCount={streakCount}
                    onHoverChange={setIsSidebarHovered}
                />
            </div>
            {/* Mobile Sidebar */}
            <div className="md:hidden">
                <Sidebar streakCount={streakCount} />
            </div>

            {/* Main Content Wrapper */}
            <main
                className={cn(
                    "h-full min-h-screen flex flex-col transition-all duration-300 ease-in-out",
                    "bg-slate-50 dark:bg-slate-950 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:48px_48px]",
                    contentPadding
                )}
            >
                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
