"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { togglePrivacy } from "@/lib/actions";

interface PrivacySectionProps {
    isPrivate: boolean;
}

export function PrivacySection({ isPrivate }: PrivacySectionProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [privateState, setPrivateState] = useState(isPrivate);

    const handleToggle = async (checked: boolean) => {
        setIsLoading(true);
        // Optimistic update
        setPrivateState(checked);
        try {
            await togglePrivacy(checked);
            toast.success(checked ? "Profile is now private" : "Profile is now public");
        } catch (error: any) {
            toast.error("Failed to update privacy settings");
            setPrivateState(!checked); // Revert
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="border rounded-lg p-4 flex items-center justify-between bg-card text-card-foreground shadow-sm">
            <div className="space-y-0.5">
                <Label htmlFor="privacy-mode" className="text-base font-medium">
                    Private Profile
                </Label>
                <p className="text-sm text-muted-foreground">
                    When enabled, your profile will be hidden from the Explore page and search results.
                    Only approved followers can see your activity.
                </p>
            </div>
            <Switch
                id="privacy-mode"
                checked={privateState}
                onCheckedChange={handleToggle}
                disabled={isLoading}
            />
        </div>
    );
}
