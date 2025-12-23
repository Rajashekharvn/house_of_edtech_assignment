"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { deleteAccount } from "@/lib/actions";

export function DeleteAccountSection() {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { signOut } = useClerk();
    const router = useRouter();

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteAccount();
            toast.success("Account deleted successfully");
            await signOut(() => router.push("/sign-in"));
        } catch (error: any) {
            toast.error(error.message || "Failed to delete account");
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-6 rounded-lg">
            <div>
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Once you delete your account, there is no going back. All your learning paths, progress, and data will be permanently removed.
                    This includes any content visible on the Explore page.
                </p>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                            {isLoading ? "Deleting..." : "Delete Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
