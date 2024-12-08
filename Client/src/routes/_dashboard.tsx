import { ConnectionStatus } from '@/components/ConnectionStatus.tsx'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: ConnectionStatus,
  component: () => <Outlet />,
})