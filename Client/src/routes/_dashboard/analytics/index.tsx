import {ConnectionStatus} from "@/components/ConnectionStatus.tsx";
import HomePage from "@/routes/_dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_dashboard/analytics/')({
    component: HomePage,
})
