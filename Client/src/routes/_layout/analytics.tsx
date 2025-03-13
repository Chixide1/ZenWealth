import { createFileRoute } from "@tanstack/react-router";
import {ExpensesPie} from "@/components/features/analytics/ExpensesPie.tsx";

export const Route = createFileRoute("/_layout/analytics")({
    component: AnalyticsPage,
});

function AnalyticsPage() {
    return <div className="">
        <ExpensesPie />
    </div>;
}
