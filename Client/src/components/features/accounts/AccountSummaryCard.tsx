import {cn} from "@/lib/utils.ts";
import { TrendingUp } from "lucide-react";
import {Card, CardContent, CardDescription, CardFooter, CardTitle} from "@/components/ui/card";
import {TrendingBadge} from "@/components/features/accounts/TrendingBadge.tsx";

type AccountSummaryCardProps = {
    className?: string,
    dataTitle: string,
    amount: number,
    flip?: boolean,
    previousMonthChange: number,
    previousMonth?: number,
}

export function AccountSummaryCard({dataTitle, className, amount = 0, previousMonth = 0, previousMonthChange = 0,  flip = false}: AccountSummaryCardProps) {
    const percentChange = previousMonthChange < 0 ? `${previousMonthChange}%` : `+${previousMonthChange}%`;
    
    return (
        <Card className={cn("bg-primary/10 col-span-3 p-5 rounded-2xl border-0", className)}>
            <TrendingBadge percentage={-20} className="float-right"/>
            <CardContent className="p-0">
                <CardTitle className="text-neutral-400/90 text-xs font-semibold w-1/2">Total {dataTitle}</CardTitle>
                <p className=" mt-1 text-lg">£ {amount.toLocaleString()}</p>
            </CardContent>
            <hr className="border-neutral-700 my-3 border-t-[1.5px]"/>
            <CardFooter className="p-0 ">
                <h6 className="text-neutral-400/90 text-xs font-semibold mr-2">Last Month</h6>
                <p className="text-xs">£ {previousMonth.toLocaleString()}</p>
            </CardFooter>
        </Card>
    )
}