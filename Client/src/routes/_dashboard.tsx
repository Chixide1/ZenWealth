import { ConnectionStatus } from '@/components/shared/ConnectionStatus.tsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard')({
  component: ConnectionStatus,
})