import { getPathDetails } from "@/lib/actions";

import { PathHero } from "@/components/PathHero";
import { PublicResourceList } from "@/components/PublicResourceList";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ClonePathButton } from "@/components/ClonePathButton";

export default async function PublicPathPage({ params }: { params: Promise<{ pathId: string }> }) {
    const { pathId } = await params;
    let path;

    try {
        // getPathDetails handles auth checks and public visibility
        path = await getPathDetails(pathId);
    } catch (error) {
        return notFound();
    }

    // Prepare path data with isCompleted for ReadOnly view
    const pathWithResources = {
        ...path,
        resources: path.resources.map((res: any) => ({
            ...res,
            isCompleted: false // Default to false for public/preview
        }))
    };

    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* 1. Hero (Read-only) */}
                <div className="relative">
                    <PathHero path={pathWithResources} isReadOnly={true} />
                    <div className="absolute top-8 right-6 md:right-auto md:left-full md:ml-4 hidden md:block">
                        {/* Optional: Floating action button for desktop? 
                            Actually, simpler to put it in the flow. 
                        */}
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-12">
                    {/* 2. Resources Timeline */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Curriculum</h2>
                            <ClonePathButton pathId={path.id} />
                        </div>
                        <PublicResourceList resources={pathWithResources.resources} />
                    </div>
                </div>
            </main>
        </div>
    );
}
