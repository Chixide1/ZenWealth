import { useRouter} from "@tanstack/react-router";
import {Button} from "@/components/ui/button.tsx";

export function ErrorPage() {
    const router = useRouter();
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-transparent">
            {/* Grid background */}
            <div
                className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"
                style={{ backgroundSize: "20px 20px" }}
            ></div>

            {/* Large 404 background */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10">
                <span className="text-[25rem] font-bold text-secondary">ERROR</span>
            </div>

            {/* Content */}
            <div className="z-10 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl font-bold text-primary mb-4">An Error Occurred</h1>
                <p className="text-neutral-400 mb-8 max-w-md text-xl">
                    Oops, something went wrong..
                </p>

                <Button
                    className=""
                    variant="default"
                    size="lg"
                    onClick={() => router.history.back()}
                >
                    &larr; Go Back
                </Button>
            </div>
        </div>
    );
}

