import { createFileRoute } from "@tanstack/react-router";
import {BudgetTable} from "@/components/features/budgets/BudgetTable.tsx";
import {SpendingProgressCard} from "@/components/features/budgets/SpendingProgressCard.tsx";
import {BudgetSummary} from "@/components/features/budgets/BudgetSummary.tsx";

export const Route = createFileRoute("/_layout/budgets")({
    component: BudgetsPage,
});

function BudgetsPage() {
    return (
        <div className="p-4 pb-8">
            <BudgetSummary className="mb-4" />
            <div className="flex flex-col md:flex-row gap-4">
                <BudgetTable className="w-full md:w-8/12 h-fit" />
                <SpendingProgressCard className="w-full md:w-4/12 h-fit" />
            </div>
        </div>
    );
}
