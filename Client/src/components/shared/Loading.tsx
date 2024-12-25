import { Loader2 } from "lucide-react";

export default function Loading({fullScreen = true}: {fullScreen?: boolean}) {
    return (
        <div className={`w-full flex items-center justify-center ${fullScreen && 'h-screen'}`}>
            <Loader2 width={40} height={40} className={"animate-spin text-primary"}/>
        </div>
    )
}
