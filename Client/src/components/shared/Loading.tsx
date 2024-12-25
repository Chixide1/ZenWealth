import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <Loader2 width={40} height={40} className={"animate-spin text-primary"}/>
        </div>
    )
}