import { createFileRoute } from '@tanstack/react-router'
import {AccountSummaryCard} from "@/components/features/accounts/AccountSummaryCard.tsx";
import {TotalBalanceCard} from "@/components/features/accounts/TotalBalanceCard.tsx";

export const Route = createFileRoute('/_layout/')({
  component: DashboardPage,
})

function DashboardPage() {
    
  return (
      <div className="grid grid-cols-12 gap-2 px-8">
          <AccountSummaryCard dataTitle="Income" amount={2100} previousMonthChange={20}/>
          <AccountSummaryCard dataTitle="Expenditure" flip={true} amount={1500} previousMonthChange={-20}/>
          <AccountSummaryCard dataTitle="Savings" amount={500} previousMonthChange={20}/>
          <AccountSummaryCard dataTitle="Debt" flip={true} amount={750} previousMonthChange={-20}/>
          <TotalBalanceCard />
      </div>
  )
}
