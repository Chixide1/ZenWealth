import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return <div className=""></div>;
}
