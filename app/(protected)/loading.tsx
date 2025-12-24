import { Loader } from "@/components/ui/loader";

export default function Loading() {
    return (
        <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
            <Loader size="xl" />
        </div>
    );
}
