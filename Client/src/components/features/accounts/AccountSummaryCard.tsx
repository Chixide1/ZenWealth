import {cn} from "@/lib/utils.ts";
import {Card, CardContent, CardFooter, CardTitle} from "@/components/ui/card";
import {TrendingBadge} from "@/components/features/accounts/TrendingBadge.tsx";

type AccountSummaryCardProps = {
    className?: string,
    dataTitle: string,
    amount: number,
    previousAmount: number,
    invert?: boolean
}

export function AccountSummaryCard({dataTitle, className, amount, previousAmount, invert = false}: AccountSummaryCardProps) {
    const percentage = ((amount - previousAmount) / previousAmount) * 100;

    const parser = new Intl.NumberFormat(["en-US", "en-GB"], {
        style: "currency",
        currency: "GBP",
        currencyDisplay: "symbol",
    })
    
    return (
        <Card className={cn("bg-primary/10 col-span-3 p-5 rounded-2xl border-0", className)}>
            <TrendingBadge percentage={percentage} className="float-right" invert={invert}/>
            <CardContent className="p-0">
                <CardTitle className="text-neutral-400/90 text-xs font-semibold w-1/2">Total {dataTitle}</CardTitle>
                <p className=" mt-1 text-lg">{parser.format(amount)}</p>
            </CardContent>
            <hr className="border-neutral-700 my-3 border-t-[1.5px]"/>
            <CardFooter className="p-0 flex items-center">
                <h6 className="text-neutral-400/90 text-xs font-semibold mr-2">Last Month:</h6>
                <p className="text-xs">{parser.format(previousAmount)}</p>
            </CardFooter>
        </Card>
    )
}