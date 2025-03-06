import { Progress } from "@/components/ui/progress";
import {useState } from "react";
import {categoryMap, cn} from "@/lib/utils";
import { defaultBudgetItems} from "@/components/features/budgets/BudgetColumns.tsx";
import { BudgetItem } from "@/types";

export function SpendingProgressCard({className}: {className?: string}) {
    const [items] = useState<BudgetItem[]>(defaultBudgetItems);
    
    return (
        <div className={cn("rounded-lg bg-offblack border-neutral-800 border p-6", className)}>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-medium text-primary">Spending progress</h2>
            </div>
            <div className="space-y-6">
                {items.sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit))
                    .map((item, index) => {
                        const percentage = item.spent / item.limit * 100;
                    
                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={categoryMap.get(item.category)}
                                            alt="an image of the category logo"
                                            className="rounded min-w-4 h-auto ms-1 w-4"
                                        />
                                        <span className="text-sm font-medium">{item.category.replace(/_/g, " ")}</span>
                                    </div>
                                    <div className="text-sm font-medium">
                                        {percentage.toFixed(2)}% <span className="text-neutral-400">of 100%</span>
                                    </div>
                                </div>
                                <Progress
                                    value={percentage > 100 ? 100 : Number(percentage.toFixed(2))}
                                    className="h-5 bg-charcoal rounded-sm"
                                    indicatorClassName={percentage >= 100 ? "from-red-500 to-red-700" : ""}
                                />
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

