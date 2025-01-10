import {cn} from "@/lib/utils.ts";
import { LucideIcon } from "lucide-react";
import {Button} from "@/components/core/button.tsx";

type AccountSummaryCardProps = {
    className?: string,
    dataTitle: string,
    amount: number,
    flip?: boolean,
    previousMonthChange: number,
    Icon: LucideIcon,
}

export function AccountSummaryCard({dataTitle, className, amount = 0, previousMonthChange = 0, Icon, flip = false}: AccountSummaryCardProps) {
    const percentChange = previousMonthChange < 0 ? `${previousMonthChange}%` : `+${previousMonthChange}%`;
    
    return (
        <div className={cn("bg-primary/10 col-span-4 p-1 rounded-2xl border border-neutral-700", className)}>
            <div className="float-right flex flex-col justify-between items-end h-full">
                <div className="bg-primary/10 p-2 rounded-full w-fit">
                    <Icon className="text-primary h-auto w-5"/>
                </div>
                <Button className="pb-3 pe-2" variant="ghost" size="sm">View All {">"}</Button>
            </div>
            <div className="p-3 w-fit">
                <h2 className="text-lg">{dataTitle}</h2>
                <h6 className="text-neutral-500 text-xs font-semibold mt-8">This Month's {dataTitle}</h6>
                <p className="text-lg">
                    £{amount}
                    <span
                        className={`text-xs ${flip ? 
                                previousMonthChange < 0 ? "text-secondary" : "text-red-500" : 
                                previousMonthChange < 0 ? "text-red-500" : "text-secondary"}`}
                    >
                        &nbsp;{percentChange}
                    </span>
                </p>
            </div>
        </div>
    )
}