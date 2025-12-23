import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { DeleteAccountSection } from "@/components/settings/DeleteAccountSection";
import { PrivacySection } from "@/components/settings/PrivacySection";
import { DataExportSection } from "@/components/settings/DataExportSection";

export default async function SettingsPage() {
    const user = await checkUser();

    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="privacy">Privacy</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>

                {/* PROFILE TAB */}
                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>
                                Update your personal information, bio, and study goals.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfileForm
                                user={{
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    bio: user.bio,
                                    dailyGoal: user.dailyGoal
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* APPEARANCE TAB */}
                <TabsContent value="appearance" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize the look and feel of the application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium">Theme</p>
                                    <p className="text-sm text-muted-foreground">
                                        Select your preferred color theme.
                                    </p>
                                </div>
                                <ThemeToggle className="h-10 w-10 border-input" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PRIVACY TAB */}
                <TabsContent value="privacy" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Privacy</CardTitle>
                            <CardDescription>
                                Manage your public visibility and data settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PrivacySection isPrivate={user.isPrivate} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ACCOUNT TAB */}
                <TabsContent value="account" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                                Manage your account access and data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <DataExportSection />
                            <DeleteAccountSection />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
