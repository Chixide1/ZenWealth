import {Badge} from "@/components/ui/badge.tsx";
import {TrendingDown, TrendingUp } from "lucide-react";
import {cn} from "@/lib/utils.ts";

type TrendingBadgeProps = {
    percentage: number,
    invert?: boolean,
    className?: string
}

export function TrendingBadge({percentage, invert = false, className}: TrendingBadgeProps) {
    const lossOrGain = invert ? percentage > 0 : percentage < 0;
    
    return(
        <Badge
            className={
                cn(`${lossOrGain ? "bg-red-500/20 hover:bg-red-500/15" : "bg-secondary/20 hover:bg-secondary/15"}  
                rounded-sm flex gap-px items-center px-2`, className)
            }
        >
            <span className={"text-xs " + (lossOrGain ? " text-red-500" : "text-secondary")}>
                {percentage.toFixed(2)}%
            </span>
            {lossOrGain ?
                (<TrendingDown className="text-red-500 h-auto ml-1 w-4"/>) :
                (<TrendingUp className="text-secondary h-auto ml-1 w-4"/>)
            }
        </Badge>
    )
}