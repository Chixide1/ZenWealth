﻿import { createFileRoute } from "@tanstack/react-router";
import { ExpensesRoseChart} from "@/components/features/transactions/ExpensesRoseChart.tsx";
import { useAtom } from "jotai";
import {categoryTotalsAtom, financialPeriodsAtom} from "@/lib/atoms.ts";
import {IncomeExpensesOverviewCard} from "@/components/features/transactions/IncomeExpensesOverviewCard";

export const Route = createFileRoute("/_layout/analytics")({
    component: AnalyticsPage,
});

function AnalyticsPage() {
    const [{data: categoryTotals}] = useAtom(categoryTotalsAtom);
    const [{data: financialPeriods}] = useAtom(financialPeriodsAtom);
    
    // console.log(monthlyBreakdowns);
    return (
        <section className="px-4 pb-8 space-y-6 w-dvw">
            <ExpensesRoseChart className="" data={categoryTotals ?? []} />
            <IncomeExpensesOverviewCard data={financialPeriods ?? []} />
        </section>
    );
}
