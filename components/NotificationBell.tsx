"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
    id: string;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    actorId?: string | null;
    pathId?: string | null;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll every 30s
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkRead = async (id: string) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("All marked as read");
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            handleMarkRead(notification.id);
        }
        setIsOpen(false);

        if (notification.type === "FOLLOW" && notification.actorId) {
            router.push(`/profile/${notification.actorId}`);
        } else if (notification.type === "STAR" && notification.pathId) {
            // Can't easily navigate to path detail yet if it's a modal, but maybe dashboard?
            // For now, let's just go to dashboard or explore.
            // Ideally we should open the PreviewDialog for that path.
            router.push("/dashboard"); // Simplified for now
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-black" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="text-xs h-auto px-2" onClick={handleMarkAllRead}>
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">
                            No notifications
                        </div>
                    ) : (
                        <div className="py-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-3 cursor-pointer",
                                        !notification.isRead && "bg-slate-50 dark:bg-slate-900/50"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start justify-between w-full gap-2">
                                        <p className={cn("text-sm", !notification.isRead && "font-medium")}>
                                            {notification.message}
                                        </p>
                                        {!notification.isRead && (
                                            <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
