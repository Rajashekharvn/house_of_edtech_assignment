"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react";
import { useState } from "react";
import { createLearningPath } from "@/lib/actions";

export function CreatePathDialog() {
    const [open, setOpen] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        await createLearningPath(formData);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200" suppressHydrationWarning>
                    <Plus className="h-4 w-4" /> Create New Path
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Learning Path</DialogTitle>
                    <DialogDescription>
                        Start a new journey. Give your path a title.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="e.g., Master Next.js 16" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" defaultValue="development">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="development">Development</SelectItem>
                                <SelectItem value="design">Design</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select name="difficulty" defaultValue="Beginner">
                            <SelectTrigger>
                                <SelectValue placeholder="Select Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="What will you learn?" />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Path</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
