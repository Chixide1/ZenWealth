import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {cn, currencyParser} from "@/lib/utils.ts";
import {ArrowLink} from "@/components/shared/ArrowLink.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import {useEffect, useState } from "react";

type TopExpenseCategoriesCardProps = {
    className?: string,
    gaugeData: GaugeProps[],
}

export function TopExpenseCategoriesCard({className, gaugeData}: TopExpenseCategoriesCardProps) {
    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <CardTitle className="">Top Expense Categories</CardTitle>
                    <ArrowLink to="/transactions" />
            </CardHeader>
            <CardContent className="space-y-6 pt-4 pb-10 text-sm">
                {gaugeData.map((gauge, index) => (
                    <Gauge key={index + "::TopExpenseCategoriesCardGauge"} {...gauge} />
                ))}
            </CardContent>
        </Card>
    )
}

export type GaugeProps = {
    categoryName: string,
    categoryIconUrl: string,
    categoryAmount: number,
    totalAmount: number,
}

function Gauge({ categoryName, categoryIconUrl, categoryAmount = 0, totalAmount = 0 }: GaugeProps){
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Simulate a delay before setting the progress
        const timer = setTimeout(() => {
            setProgress((categoryAmount / totalAmount * 100))
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    return (
        <div>
            <div className="flex items-center mb-2">
                <div className="inline-flex items-center gap-2 w-fit" >
                    <img
                        width={30}
                        height="100%"
                        alt="an image of the category"
                        src={categoryIconUrl ?? "https://plaid-category-icons.plaid.com/PFC_OTHER.png"}
                    />
                    <span>{categoryName}</span>
                </div>
                <p className="ml-auto w-fit text-neutral-400">
                    <span className="text-primary">
                        {currencyParser.format(categoryAmount)}
                    </span>
                    &nbsp;of {currencyParser.format(totalAmount)}
                </p>
            </div>
            <Progress
                className="h-6 rounded-sm"
                value={progress}
                max={100}
            />
        </div>
    )
}

export default TopExpenseCategoriesCard;