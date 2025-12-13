"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addResource } from "@/lib/actions";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

export function AddResourceForm({ pathId }: { pathId: string }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [type, setType] = useState("article");

    const handleSubmit = async (formData: FormData) => {
        await addResource(formData);
        formRef.current?.reset();
    };

    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="text-lg">Add New Resource</CardTitle>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="pathId" value={pathId} />

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="Resource Title" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select name="type" defaultValue="article" onValueChange={(value) => setType(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="article">Article Link</SelectItem>
                                <SelectItem value="video">YouTube Video</SelectItem>
                                <SelectItem value="code">Code Snippet</SelectItem>
                                <SelectItem value="text">Text Note</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(type === 'article' || type === 'video') ? (
                        <div className="space-y-2">
                            <Label htmlFor="url">URL Link</Label>
                            <Input id="url" name="url" placeholder="https://..." required />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <textarea
                                id="content"
                                name="content"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder={type === 'code' ? "Paste your code here..." : "Write your note here..."}
                                required
                            />
                        </div>
                    )}
                    <Button type="submit" className="w-full gap-2">
                        <Plus className="w-4 h-4" /> Add Resource
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
