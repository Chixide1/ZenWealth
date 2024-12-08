import { ConnectionStatus } from '@/components/shared/ConnectionStatus.tsx'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: ConnectionStatus,
  component: () => <Outlet />,
})