import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/accounts')({
  component: AccountsPage,
})

function AccountsPage() {
  return <div className=""></div>
}
