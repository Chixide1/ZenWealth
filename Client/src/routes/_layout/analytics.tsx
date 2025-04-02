import { createFileRoute } from "@tanstack/react-router";
import { ExpensesRoseChart} from "@/components/features/transactions/ExpensesRoseChart.tsx";
import { useAtom } from "jotai";
import {categoryTotalsAtom, financialPeriodsAtom, monthlyBreakdownsAtom} from "@/lib/atoms.ts";
import {MonthlyBreakdownBarChart} from "@/components/features/transactions/MonthlyBreakdownBarChart.tsx";

export const Route = createFileRoute("/_layout/analytics")({
    component: AnalyticsPage,
});

function AnalyticsPage() {
    const [{data: categoryTotals}] = useAtom(categoryTotalsAtom);
    const [{data: financialPeriods}] = useAtom(financialPeriodsAtom);
    
    // console.log(monthlyBreakdowns);
    return (
        <section className="px-4 pb-8 space-y-6">
            <ExpensesRoseChart className="" data={categoryTotals ?? []} />
            <MonthlyBreakdownBarChart data={financialPeriods ?? []} />
        </section>
    );
}
