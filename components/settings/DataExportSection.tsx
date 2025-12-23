"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportUserData } from "@/lib/actions";

export function DataExportSection() {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const jsonString = await exportUserData();

            // Create a blob and download it
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `mind-sprout-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Data export ready");
        } catch (error: any) {
            toast.error("Failed to export data");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h3 className="text-base font-medium">Export Your Data</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Download a copy of all your learning paths, resources, and progress in JSON format.
                </p>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                {isLoading ? "Generating..." : "Download Data"}
            </Button>
        </div>
    );
}
