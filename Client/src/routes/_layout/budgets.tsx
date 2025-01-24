import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/budgets')({
  component: BudgetsPage,
})

function BudgetsPage() {
  return <div className=""></div>
}
