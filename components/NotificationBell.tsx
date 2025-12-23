"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, Check, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNotifications, markNotificationRead, markAllNotificationsRead, acceptFollowRequest, declineFollowRequest, toggleFollow, deleteAllNotifications } from "@/lib/actions";

interface Notification {
    id: string;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    actorId?: string | null;
    pathId?: string | null;
    isFollowingActor?: boolean;
}

export function NotificationBell({ className }: { className?: string }) {
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

    const handleAccept = async (actorId: string, notificationId: string) => {
        try {
            await acceptFollowRequest(actorId, notificationId); // actorId is the follower
            toast.success("Follow request accepted");
            // Mark notification as read
            await handleMarkRead(notificationId);
            // Ideally remove the "Accept/Decline" buttons locally or refresh
            fetchNotifications();
        } catch (error) {
            toast.error("Failed to accept request");
        }
    };

    const handleDecline = async (actorId: string, notificationId: string) => {
        try {
            await declineFollowRequest(actorId, notificationId);
            toast.success("Follow request declined");
            await handleMarkRead(notificationId);
            fetchNotifications();
        } catch (error) {
            toast.error("Failed to decline request");
        }
    };

    const handleFollowBack = async (actorId: string) => {
        try {
            await toggleFollow(actorId);
            toast.success("Followed");
            fetchNotifications(); // Refresh to update "isFollowingActor" status
        } catch (error) {
            toast.error("Failed to follow");
        }
    };

    const handleClearAll = async () => {
        try {
            await deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
            toast.success("All notifications cleared");
        } catch (error) {
            toast.error("Failed to clear notifications");
        }
    }

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            handleMarkRead(notification.id);
        }
        // Keep open on click? User said "until I close".

        if (notification.type === "FOLLOW" && notification.actorId) {
            router.push(`/profile/${notification.actorId}`);
        } else if (notification.type === "STAR" && notification.pathId) {
            router.push("/dashboard");
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("relative", className)}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-black" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                side="right"
                align="end"
                sideOffset={20}
                className="w-96 p-0 overflow-hidden shadow-2xl border-slate-200 dark:border-slate-800"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 px-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                onClick={handleMarkAllRead}
                            >
                                <Check className="h-3 w-3 mr-1" /> Mark all
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10" onClick={handleClearAll} title="Clear all">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                            <Bell className="h-8 w-8 text-slate-300 mb-2" />
                            <p>No new notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col gap-1 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative",
                                        !notification.isRead && "bg-indigo-50/30 dark:bg-indigo-900/10"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <p className={cn("text-sm leading-snug", !notification.isRead && "font-medium text-slate-900 dark:text-slate-100")}>
                                            {notification.message}
                                        </p>
                                        {!notification.isRead && (
                                            <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                        )}
                                    </div>

                                    {notification.type === "REQUEST_FOLLOW" && notification.actorId && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Button
                                                size="sm"
                                                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAccept(notification.actorId!, notification.id);
                                                }}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs border-slate-200 dark:border-slate-700"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDecline(notification.actorId!, notification.id);
                                                }}
                                            >
                                                Decline
                                            </Button>
                                        </div>
                                    )}

                                    {notification.type === "REQUEST_ACCEPTED" && notification.actorId && (
                                        <div className="mt-2">
                                            {notification.isFollowingActor ? (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    disabled
                                                    className="h-7 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800"
                                                >
                                                    Following
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFollowBack(notification.actorId!);
                                                    }}
                                                >
                                                    Follow Back
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    <span className="text-xs text-slate-400 mt-1">
                                        {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
