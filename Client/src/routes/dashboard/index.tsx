import { createFileRoute } from '@tanstack/react-router'
import {Auth} from "@/components/Auth.tsx";

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: Auth,
  component: DashboardPage,
})

export function DashboardPage() {
  return <h1 className={'text-5xl text-secondary'}>Dashboard</h1>
}
