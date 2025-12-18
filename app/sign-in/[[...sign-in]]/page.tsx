import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
            <div className="absolute inset-0 z-0 bg-indigo-500/20 blur-[100px] rounded-full scale-50 opacity-50" />
            <div className="relative z-10">
                <SignIn />
            </div>
        </div>
    );
}
