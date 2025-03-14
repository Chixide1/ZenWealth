import { createFileRoute } from "@tanstack/react-router";
import { ExpensesRoseChart} from "@/components/features/analytics/ExpensesRoseChart.tsx";
import { useAtom } from "jotai";
import {categoryTotalsAtom} from "@/lib/atoms.ts";

export const Route = createFileRoute("/_layout/analytics")({
    component: AnalyticsPage,
});

function AnalyticsPage() {
    const [{data}] = useAtom(categoryTotalsAtom);
    
    console.log(data)
    return (
        <div className="">
            <ExpensesRoseChart data={data ?? []} />
        </div>
    );
}
