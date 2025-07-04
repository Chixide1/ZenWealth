import { createFileRoute } from "@tanstack/react-router";
import {BudgetTable} from "@/components/features/budgets/BudgetTable.tsx";
import {SpendingProgressCard} from "@/components/features/budgets/SpendingProgressCard.tsx";
import {BudgetSummary} from "@/components/features/budgets/BudgetSummary.tsx";
import { useAtom } from "jotai";
import {budgetsAtom} from "@/lib/atoms.ts";
import { getAllBudgets} from "@/lib/utils.ts";

export const Route = createFileRoute("/_layout/budgets")({
    component: RouteComponent,
});

function RouteComponent() {
    "use no memo" //eslint-disable-line
    
    const [{data}] = useAtom(budgetsAtom);
    const budgets = getAllBudgets(data);
    
    // console.log(budgets);
     
    return (
        <div className="p-4 pb-8 w-screen">
            <BudgetSummary budgets={budgets} className="mb-4" />
            <div className="flex flex-col md:flex-row gap-4">
                <BudgetTable budgets={budgets} className="w-full md:w-8/12 h-fit animate-in slide-in-from-bottom-1/4 duration-300" />
                <SpendingProgressCard budgets={budgets} className="w-full md:w-4/12 h-fit" />
            </div>
        </div>
    );
}
