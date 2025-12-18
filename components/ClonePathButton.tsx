"use client";

import { Button } from "@/components/ui/button";
import { Copy, Loader2, CheckCircle } from "lucide-react";
import { cloneLearningPath } from "@/lib/actions";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ClonePathButton({ pathId }: { pathId: string }) {
    const [isCloning, setIsCloning] = useState(false);
    const router = useRouter();

    const handleClone = async () => {
        setIsCloning(true);
        try {
            await cloneLearningPath(pathId);
            toast.success("Path added to your dashboard!");
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            toast.error("Failed to clone path");
        } finally {
            setIsCloning(false);
        }
    };

    return (
        <Button
            onClick={handleClone}
            disabled={isCloning}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-600/20"
        >
            {isCloning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
            Clone to Dashboard
        </Button>
    );
}
