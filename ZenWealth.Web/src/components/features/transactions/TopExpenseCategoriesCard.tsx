import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {cn, currencyParser} from "@/lib/utils.ts";
import {ArrowLink} from "@/components/shared/ArrowLink.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import {useEffect, useState } from "react";
import {TopExpenseCategory} from "@/types.ts";

type TopExpenseCategoriesCardProps = {
    className?: string,
    data: TopExpenseCategory[],
}

export function TopExpenseCategoriesCard({className, data}: TopExpenseCategoriesCardProps) {
    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="">Top Expense Categories</CardTitle>
                <ArrowLink to="/analytics" />
            </CardHeader>
            <CardContent className="flex flex-col gap-8 pt-4 pb-10 text-sm">
                {data.length > 0 ? data.map((barData, index) => (
                    <TopExpenseCategoryProgressBar key={index + "::TopExpenseCategoriesCardGauge"} {...barData} />
                )) : <div className="w-full text-neutral-400 text-center pt-20">
                    <h2 className="text-xl">No Data...</h2>
                </div>}
            </CardContent>
        </Card>
    );
}

function TopExpenseCategoryProgressBar({ category, expenditure = 0, total = 0, iconUrl}: TopExpenseCategory){
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
                <div className="inline-flex items-center gap-2 w-fit" >
                    <img
                        width={30}
                        height="100%"
                        alt="an image of the category"
                        src={iconUrl ?? "https://plaid-category-icons.plaid.com/PFC_OTHER.png"}
                    />
                    <div className="inline-flex flex-col lg:flex-row lg:gap-2  w-fit" >
                        <span title={category} className="truncate md:max-w-20 lg:max-w-44">{category}</span>
                        <span title="Percentage" className="text-neutral-400">{percentage.toFixed(2)}%</span>
                    </div>
                </div>
                <p className="ml-auto w-fit text-end text-neutral-400 max-w-[50%]">
                    <span title="Expenditure" className="text-primary">
                        {currencyParser.format(expenditure)}
                    </span>
                    <span title="Total Expenditure" className="block md:inline">
                        &nbsp;of {currencyParser.format(total)}
                    </span>
                </p>
            </div>
            <Progress
                className="h-8 rounded-sm bg-primary/5"
                value={progress}
                max={100}
            />
        </div>
    );
}

export default TopExpenseCategoriesCard;