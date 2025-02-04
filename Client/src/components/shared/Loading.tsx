import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function Loading({fullScreen = true, className}: {fullScreen?: boolean, className?: string}) {
    return (
        <div className={`w-full flex items-center justify-center ${fullScreen && 'h-screen'}`}>
            <Loader2 width={40} height={40} className={cn("animate-spin text-primary", className)}/>
        </div>
    )
}
