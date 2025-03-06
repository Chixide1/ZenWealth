import { DollarSign, PiggyBank, CreditCard, Wallet } from "lucide-react";
import {cn, currencyParser} from "@/lib/utils.ts";

const summaryItems = [
    {
        icon: <DollarSign className="h-5 w-5 text-primary" />,
        title: "Total budget",
        amount: 2000,
    },
    {
        icon: <CreditCard className="h-5 w-5 text-primary" />,
        title: "Planned spending",
        amount: 1670,
    },
    {
        icon: <Wallet className="h-5 w-5 text-primary" />,
        title: "Spent so far",
        amount: 1494,
    },
    {
        icon: <PiggyBank className="h-5 w-5 text-primary" />,
        title: "Remaining",
        amount: 506,
    },
];

export function BudgetSummary({className}: {className?: string}) {

    return (
        <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
            {summaryItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 rounded-lg border border-neutral-600/50 bg-background odd:bg-offblack odd:border-neutral-800 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">{item.icon}</div>
                    <div>
                        <p className="text-lg font-medium text-white">{currencyParser.format(item.amount)}</p>
                        <p className="text-xs text-neutral-400">{item.title}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

