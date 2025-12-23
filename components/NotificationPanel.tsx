"use client";

import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const handleMarkRead = async (id: string) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("All marked as read");
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            handleMarkRead(notification.id);
        }

        if (notification.type === "FOLLOW" && notification.actorId) {
            router.push(`/profile/${notification.actorId}`);
            // Keep open or close? User said "open until I close", so keep open.
        } else if (notification.type === "STAR" && notification.pathId) {
            router.push(`/dashboard/paths/${notification.pathId}`);
        }
    };

    return (
        <div
            className={cn(
                "fixed top-0 bottom-0 w-80 bg-background border-r border-slate-200 dark:border-slate-800 z-30 transition-all duration-300 ease-in-out shadow-xl flex flex-col",
                isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
                // Position based on sidebar. 
                // We'll use a specific left equivalent to 80px (collapsed sidebar) usually, 
                // or we can mount it inside ShellLayout right next to sidebar.
                // Assuming this is rendered in ShellLayout at same level as sidebar.
                // If Sidebar is fixed left-0 w-80px/w-64.
                // This panel should ideally be 'left-[80px]'.
                "left-[80px]"
            )}
        >
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-semibold text-lg">Notifications</h2>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6"
                    onClick={handleMarkAllRead}
                    disabled={notifications.every(n => n.isRead)}
                >
                    <Check className="h-3 w-3 mr-1" /> Mark all read
                </Button>
            </div>

            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">No notifications</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col gap-2 relative",
                                    !notification.isRead && "bg-blue-50/50 dark:bg-blue-900/10"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                {!notification.isRead && (
                                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500" />
                                )}
                                <p className="text-sm leading-snug pr-4">
                                    {notification.message}
                                </p>
                                <span className="text-xs text-slate-400">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
