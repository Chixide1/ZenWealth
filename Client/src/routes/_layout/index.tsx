import { createFileRoute } from '@tanstack/react-router'
import {AccountSummaryCard} from "@/components/features/accounts/AccountSummaryCard.tsx";
import {NetWorthCard} from "@/components/features/accounts/NetWorthCard.tsx";
import {useIsMobile} from "@/hooks/use-mobile.tsx";

export const Route = createFileRoute('/_layout/')({
  component: DashboardPage,
})

function DashboardPage() {
    const isMobile = useIsMobile()
  
    return (
      <div className="grid grid-cols-12 gap-4 px-4 pb-8">
          <AccountSummaryCard dataTitle="Income" amount={2100} previousAmount={1950}/>
          <AccountSummaryCard dataTitle="Expenditure" amount={1500} previousAmount={1900} invert={true}/>
          <AccountSummaryCard dataTitle="Savings" amount={500} previousAmount={627}/>
          <AccountSummaryCard dataTitle="Liabilities" amount={750} previousAmount={543} invert={true}/>
          <NetWorthCard />
      </div>
    )
}
