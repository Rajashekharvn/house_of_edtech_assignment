"use client";

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export const UserButtonWrapper = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />;
    }

    return <UserButton afterSignOutUrl="/" />;
};
