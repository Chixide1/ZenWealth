import {cn} from "@/lib/utils.ts";
import {Card, CardContent, CardFooter, CardTitle} from "@/components/ui/card";
import {TrendingBadge} from "@/components/shared/TrendingBadge.tsx";
import {currencyParser} from "@/lib/utils.ts";

type AccountSummaryCardProps = {
    className?: string,
    dataTitle: string,
    amount?: number,
    previousAmount?: number,
    invert?: boolean
}

export function AccountSummaryCard({dataTitle, className, amount = 0, previousAmount = 0, invert = false}: AccountSummaryCardProps) {
    const percentage = amount && previousAmount ? ((amount - previousAmount) / previousAmount) * 100 : 0;
    
    return (
        <Card className={cn("bg-primary/10 min-w-60 md:min-w-36 md:w-full p-5 rounded-md border-0 backdrop-blur-sm", className)}>
            <TrendingBadge percentage={percentage} className="float-right" invert={invert}/>
            <CardContent className="p-0">
                <CardTitle className="text-neutral-400/90 text-xs font-semibold w-1/2">Total {dataTitle}</CardTitle>
                <p className=" mt-1 text-lg">{currencyParser.format(amount)}</p>
            </CardContent>
            <hr className="border-neutral-600/80 my-3 border-t-[1.5px]"/>
            <CardFooter className="p-0 flex items-center">
                <h6 className="text-neutral-400/90 text-xs font-semibold mr-2">Last Month:</h6>
                <p className="text-xs">{currencyParser.format(previousAmount)}</p>
            </CardFooter>
        </Card>
    )
}