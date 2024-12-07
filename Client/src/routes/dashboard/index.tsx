import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/components/Dashboard-Page';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})
