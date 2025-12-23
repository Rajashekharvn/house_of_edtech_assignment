"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Globe,
    User,
    Sparkles,
    Menu,
    X,
    Settings,
    Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { UserButtonWrapper } from "@/components/UserButtonWrapper";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Explore Paths",
        icon: Globe,
        href: "/explore",
        color: "text-violet-500",
    },
    {
        label: "My Profile",
        icon: User,
        href: "/profile/me", // Will be handled dynamically or redirected
        color: "text-pink-700",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
        color: "text-gray-500",
    }
];

interface SidebarProps {
    streakCount?: number;
    onHoverChange?: (isHovered: boolean) => void;
}

export const Sidebar = ({ streakCount = 0, onHoverChange }: SidebarProps) => {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { userId } = useAuth();

    // Derived state for expanded view (Mobile Open OR Desktop Hover)
    const isExpanded = isMobileOpen || isHovered;

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (onHoverChange) onHoverChange(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (onHoverChange) onHoverChange(false);
    };

    // Update profile link with actual user ID if available
    const navRoutes = routes.map(route =>
        route.label === "My Profile" && userId
            ? { ...route, href: `/profile/${userId}` }
            : route
    );

    useEffect(() => {
        setIsMobileOpen(false); // Close on route change
    }, [pathname]);

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                >
                    {isMobileOpen ? <X /> : <Menu />}
                </Button>
            </div>

            {/* Sidebar Container */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out md:translate-x-0",
                    // Mobile behavior
                    isMobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full",
                    // Desktop behavior (controlled by state)
                    !isMobileOpen && "md:w-[70px]",
                    isHovered && "md:w-64 md:shadow-2xl"
                )}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="flex-1 flex flex-col py-4 overflow-hidden">
                    {/* Header / Logo */}
                    <div className="px-6 py-2 flex items-center mb-8 h-10 w-full overflow-hidden whitespace-nowrap">
                        <div className="relative w-8 h-8 mr-4 shrink-0">
                            <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className={cn(
                            "text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent transition-opacity duration-300",
                            isExpanded ? "opacity-100" : "opacity-0"
                        )}>
                            MindSprout
                        </h1>
                    </div>

                    {/* Navigation */}
                    <div className="px-3 flex-1 w-full">
                        <div className="space-y-2">
                            {navRoutes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "text-sm group flex items-center p-3 w-full font-medium cursor-pointer hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-lg transition-all overflow-hidden whitespace-nowrap",
                                        pathname === route.href
                                            ? "bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                    title={!isExpanded ? route.label : undefined}
                                >
                                    <route.icon className={cn("h-5 w-5 min-w-[20px] mr-4", route.color)} />
                                    <span className={cn(
                                        "transition-opacity duration-300",
                                        isExpanded ? "opacity-100" : "opacity-0"
                                    )}>
                                        {route.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Footer Actions */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 w-full overflow-hidden">

                    {/* Streak Widget */}
                    <div className={cn(
                        "mb-4 flex items-center justify-center px-2 py-2 bg-gradient-to-r from-orange-500/10 to-transparent rounded-lg border border-orange-200 dark:border-orange-500/20 transition-all",
                        isExpanded ? "justify-between" : "justify-center"
                    )}>
                        <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-bold" title="Days studied in a row">
                            <Flame className="h-5 w-5 fill-orange-500 shrink-0" />
                            <span className={cn(
                                "transition-opacity duration-300 whitespace-nowrap overflow-hidden w-0",
                                isExpanded ? "opacity-100 w-auto" : "opacity-0"
                            )}>
                                {streakCount}
                            </span>
                        </div>
                        <span className={cn(
                            "text-sm text-slate-600 dark:text-orange-200/80 font-medium transition-opacity duration-300 whitespace-nowrap overflow-hidden w-0 ml-2",
                            isExpanded ? "opacity-100 w-auto" : "opacity-0"
                        )}>
                            Streak
                        </span>
                    </div>

                    {/* Footer Actions Combined */}
                    <div className={cn(
                        "flex w-full transition-all gap-2 mt-auto",
                        isExpanded ? "flex-row items-center justify-between px-2" : "flex-col-reverse items-center gap-4"
                    )}>
                        <div className="flex justify-center shrink-0">
                            <UserButtonWrapper />
                        </div>

                        <div className={cn(
                            "flex items-center gap-1",
                            !isExpanded && "flex-col"
                        )}>
                            <ThemeToggle className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 border-0" />
                            <NotificationBell className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 border-0" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
};
