import { createFileRoute } from '@tanstack/react-router'
import {AccountSummaryCard} from "@/components/features/accounts/AccountSummaryCard.tsx";
import {TotalBalanceCard} from "@/components/features/accounts/TotalBalanceCard.tsx";
import { HandCoins, Banknote } from "lucide-react";

export const Route = createFileRoute('/_layout/')({
  component: HomePage,
})

function HomePage() {
    
  return (
      <div className="grid grid-cols-12 gap-2 px-6">
          <AccountSummaryCard dataTitle="Income" Icon={HandCoins} amount={2100} previousMonthChange={20}/>
          <AccountSummaryCard dataTitle="Expenditure" flip={true} Icon={Banknote} amount={1500} previousMonthChange={-20}/>
          <TotalBalanceCard />
      </div>
  )
}
