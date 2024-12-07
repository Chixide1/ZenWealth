import { createFileRoute } from '@tanstack/react-router'
import {Auth} from "@/components/Auth.tsx";
import { DashboardPage } from '@/components/Dashboard-Page';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})
