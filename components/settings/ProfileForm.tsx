"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateUserProfile } from "@/lib/actions";

interface ProfileFormProps {
    user: {
        firstName: string | null;
        lastName: string | null;
        bio: string | null;
        dailyGoal: number | null;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            await updateUserProfile(formData);
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6 max-w-xl">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                        id="firstName"
                        name="firstName"
                        defaultValue={user.firstName || ""}
                        placeholder="John"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                        id="lastName"
                        name="lastName"
                        defaultValue={user.lastName || ""}
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="dailyGoal">Daily Study Goal (minutes)</Label>
                <Input
                    id="dailyGoal"
                    name="dailyGoal"
                    type="number"
                    min="1"
                    max="1440"
                    defaultValue={user.dailyGoal || 30}
                    placeholder="30"
                />
                <p className="text-xs text-muted-foreground">
                    Target minutes per day for your streak.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={user.bio || ""}
                    placeholder="Tell us a bit about yourself..."
                    className="h-32 resize-none"
                    maxLength={300}
                />
                <p className="text-xs text-muted-foreground text-right">
                    Max 300 characters
                </p>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
