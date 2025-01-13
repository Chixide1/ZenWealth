import {Badge} from "@/components/ui/badge.tsx";
import {CardDescription} from "@/components/ui/card.tsx";
import { TrendingUp } from "lucide-react";
import {cn} from "@/lib/utils.ts";

type TrendingBadgeProps = {
    percentage: number,
    invert?: boolean,
    className?: string
}

export function TrendingBadge({percentage, invert = false, className}: TrendingBadgeProps) {
    return(
        <Badge className={cn("bg-secondary/20 rounded-sm flex gap-px items-center", className)}>
            <span
                // className={`text-xs ${flip ?
                //     previousMonthChange < 0 ? "text-secondary" : "text-red-500" :
                //     previousMonthChange < 0 ? "text-red-500" : "text-secondary"}`}
            >
                &nbsp;{percentage}
            </span>
            <TrendingUp className="text-secondary h-auto w-4 mx-2 my-1"/>
        </Badge>
    )
}