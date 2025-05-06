import {cn, currencyParser, formatDayWithOrdinal} from "@/lib/utils.ts";
import {Budget} from "@/types.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay, faCashRegister, faCoins, faPiggyBank } from "@fortawesome/free-solid-svg-icons";
import { useAtom } from "jotai";
import {budgetTotalsAtom} from "@/lib/atoms.ts";

type BudgetSummaryProps = {
    className?: string,
    budgets: Budget[],
}

export function BudgetSummary({className, budgets}: BudgetSummaryProps) {
    const [{totalLimit, totalSpent, totalRemaining}] = useAtom(budgetTotalsAtom);

    const summaryItems = [
        {
            icon: <FontAwesomeIcon icon={faCalendarDay} />,
            title: "Start Date",
            amount: budgets.some(b => b.limit > 0) ?
                formatDayWithOrdinal(budgets.find(b => b.day)?.day ?? 1) :
                "No Budgets Yet",
        },
        {
            icon: <FontAwesomeIcon icon={faPiggyBank} />,
            title: "Total budget",
            amount: totalLimit,
        },
        {
            icon: <FontAwesomeIcon icon={faCoins} /> ,
            title: "Spent so far",
            amount: totalSpent,
        },
        {
            icon: <FontAwesomeIcon icon={faCashRegister} />,
            title: "Remaining",
            amount: totalRemaining,
        },
    ];
    
    return (
        <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
            {summaryItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 rounded-lg border border-neutral-600/50 bg-background odd:bg-offblack odd:border-neutral-800 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">{item.icon}</div>
                    <div>
                        <p className="text-lg font-medium text-white">
                            {typeof item.amount == "number" ? currencyParser.format(item.amount) : item.amount}
                        </p>
                        <p className="text-xs text-neutral-400">{item.title}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

