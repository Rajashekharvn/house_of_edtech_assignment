"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/lib/actions";
import { toast } from "sonner";
import { UserMinus, UserPlus, Loader2 } from "lucide-react";

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
}

export function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const handleFollow = async () => {
        setIsLoading(true);
        // Optimistic
        setIsFollowing(!isFollowing);

        try {
            await toggleFollow(targetUserId);
        } catch (error) {
            // Revert
            setIsFollowing(!isFollowing);
            toast.error("Failed to update follow status");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleFollow}
            disabled={isLoading}
            variant={isFollowing ? "outline" : "default"}
            className={isFollowing ? "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300" : "bg-indigo-600 hover:bg-indigo-700 text-white"}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : isFollowing ? (
                <UserMinus className="w-4 h-4 mr-2" />
            ) : (
                <UserPlus className="w-4 h-4 mr-2" />
            )}
            {isFollowing ? "Unfollow" : "Follow"}
        </Button>
    );
}
