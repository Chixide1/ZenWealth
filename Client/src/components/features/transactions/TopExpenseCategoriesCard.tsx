import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {cn, currencyParser} from "@/lib/utils.ts";
import {ArrowLink} from "@/components/shared/ArrowLink.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import {useEffect, useState } from "react";
import {TopExpenseCategory} from "@/types.ts";

type TopExpenseCategoriesCardProps = {
    className?: string,
    gaugeData: TopExpenseCategory[],
}

export function TopExpenseCategoriesCard({className, gaugeData}: TopExpenseCategoriesCardProps) {
    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <CardTitle className="">Top Expense Categories</CardTitle>
                    <ArrowLink to="/transactions" />
            </CardHeader>
            <CardContent className="space-y-8 pt-4 pb-10 text-sm">
                {gaugeData.map((gauge, index) => (
                    <Gauge key={index + "::TopExpenseCategoriesCardGauge"} {...gauge} />
                ))}
            </CardContent>
        </Card>
    );
}

function Gauge({ category, expenditure = 0, total = 0, iconUrl}: TopExpenseCategory){
    const [progress, setProgress] = useState(0);
    const percentage = expenditure / total * 100;

    useEffect(() => {
        // Simulate a delay before setting the progress
        const timer = setTimeout(() => {
            setProgress(percentage);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="">
            <div className="flex items-center mb-2">
                <div className="inline-flex items-center gap-2 w-fit max-w-[50%]" >
                    <img
                        width={30}
                        height="100%"
                        alt="an image of the category"
                        src={iconUrl ?? "https://plaid-category-icons.plaid.com/PFC_OTHER.png"}
                    />
                    <div className="inline-flex flex-col md:flex-row md:gap-2 w-fit" >
                        <span className="truncate md:whitespace-normal">{category}</span>
                        <span className="text-neutral-400">{percentage.toFixed(2)}%</span>
                    </div>
                </div>
                <p className="ml-auto w-fit text-end text-neutral-400 max-w-[50%]">
                    <span className="text-primary">
                        {currencyParser.format(expenditure)}
                    </span>
                    <span className="block md:inline">
                        &nbsp;of {currencyParser.format(total)}
                    </span>
                </p>
            </div>
            <Progress
                className="h-6 rounded-sm"
                value={progress}
                max={100}
            />
        </div>
    );
}

export default TopExpenseCategoriesCard;