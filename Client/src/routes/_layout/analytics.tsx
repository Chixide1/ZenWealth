﻿import { createFileRoute } from "@tanstack/react-router";
import { ExpensesRoseChart} from "@/components/features/analytics/ExpensesRoseChart.tsx";
import { useAtom } from "jotai";
import {categoryTotalsAtom} from "@/lib/atoms.ts";

export const Route = createFileRoute("/_layout/analytics")({
    component: AnalyticsPage,
});

function AnalyticsPage() {
    const [{data}] = useAtom(categoryTotalsAtom);
    
    console.log(data);
    return (
        <section className="px-4 pb-8">
            <ExpensesRoseChart className="" data={data?.slice(0,6) ?? []} />
        </section>
    );
}
