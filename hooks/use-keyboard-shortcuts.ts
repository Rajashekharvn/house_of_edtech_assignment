"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

export function useKeyboardShortcuts() {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if inside an input or textarea
            if (
                document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement ||
                (document.activeElement as HTMLElement)?.isContentEditable
            ) {
                return;
            }

            // Ctrl/Cmd + K: Focus Search (Navigate to Dashboard and focus search)
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                router.push("/dashboard?focus=search");
                // Or if we are already on dashboard, we might want to focus the input provided we can access it.
                // For now, redirecting to dashboard is a safe bet.
            }

            // Ctrl/Cmd + H: Go Home/Dashboard
            if ((e.ctrlKey || e.metaKey) && e.key === "h") {
                e.preventDefault();
                router.push("/dashboard");
                showToast.success("Navigated to Dashboard");
            }

            // Ctrl/Cmd + E: Explore
            if ((e.ctrlKey || e.metaKey) && e.key === "e") {
                e.preventDefault();
                router.push("/explore");
                showToast.success("Navigated to Explore");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);
}
