"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addResource } from "@/lib/actions";
import { Plus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { showToast } from "@/lib/toast";

export function AddResourceDialog({ pathId }: { pathId: string }) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("article");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await addResource(formData);
            setOpen(false);
            formRef.current?.reset();
            setType("article");
            showToast.success("Resource added successfully!");
        } catch (error) {
            console.error("Failed to add resource", error);
            showToast.error("Failed to add resource. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg hover:shadow-xl transition-all bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="w-4 h-4" /> Add Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Resource</DialogTitle>
                    <DialogDescription>
                        Add videos, articles, PDFs, courses, podcasts, code snippets, or any learning resource to your path.
                    </DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleSubmit} className="space-y-4 mt-4">
                    <input type="hidden" name="pathId" value={pathId} />

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="e.g., Introduction to React Hooks" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Resource Type</Label>
                        <Select name="type" value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="article">🔗 Article Link</SelectItem>
                                <SelectItem value="video">📺 YouTube Video</SelectItem>
                                <SelectItem value="pdf">📄 PDF Document</SelectItem>
                                <SelectItem value="book">📚 Book/E-book</SelectItem>
                                <SelectItem value="course">🎓 Online Course</SelectItem>
                                <SelectItem value="podcast">🎙️ Podcast Episode</SelectItem>
                                <SelectItem value="tutorial">🧑‍💻 Tutorial</SelectItem>
                                <SelectItem value="documentation">📖 Documentation</SelectItem>
                                <SelectItem value="code">💻 Code Snippet</SelectItem>
                                <SelectItem value="exercise">✏️ Exercise/Practice</SelectItem>
                                <SelectItem value="text">📝 Text Note</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(type === 'article' || type === 'video' || type === 'pdf' || type === 'book' || type === 'course' || type === 'podcast' || type === 'tutorial' || type === 'documentation') ? (
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
                                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                placeholder={type === 'code' ? "// Paste your code here..." : type === 'exercise' ? "Describe the exercise or paste the problem..." : "Write your note here..."}
                                required
                            />
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                                </>
                            ) : (
                                "Add Resource"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
