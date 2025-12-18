"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { getFollowers, getFollowing } from "@/lib/actions";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface UserListDialogProps {
    userId: string;
    type: "followers" | "following";
    count: number;
    trigger: React.ReactNode;
}

export function UserListDialog({ userId, type, count, trigger }: UserListDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        try {
            if (type === "followers") {
                const data = await getFollowers(userId);
                setUsers(data);
            } else {
                const data = await getFollowing(userId);
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) loadUsers();
        }}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="capitalize text-slate-900 dark:text-slate-50">
                        {type}
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                        </div>
                    ) : users.length > 0 ? (
                        <div className="space-y-4 p-1">
                            {users.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/profile/${user.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    <Avatar className="h-10 w-10 border border-slate-200 dark:border-zinc-800">
                                        <AvatarImage src="" /> {/* TODO: Add Avatar URL if we have it */}
                                        <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold">
                                            {user.firstName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                                            {user.firstName} {user.lastName}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                            No {type} yet.
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
