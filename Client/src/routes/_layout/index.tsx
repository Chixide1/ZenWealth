import { createFileRoute } from '@tanstack/react-router'
import {AccountSummaryCard} from "@/components/features/accounts/AccountSummaryCard.tsx";
import {TotalBalanceCard} from "@/components/features/accounts/TotalBalanceCard.tsx";

export const Route = createFileRoute('/_layout/')({
  component: HomePage,
})

function HomePage() {
    
  return (
      <div className="px-4 grid grid-cols-12 gap-2">
          {/*<AccountSummaryCard>*/}
          {/*    <h2 className={"text-primary"}>Total Balance</h2>*/}
          {/*    <p>£50,000</p>*/}
          {/*</AccountSummaryCard>*/}
          <AccountSummaryCard>
              <h2 className={"text-primary"}>Monthly Income</h2>
              <p>£3,000</p>
          </AccountSummaryCard>
          <AccountSummaryCard>
              <h2 className={"text-primary"}>Monthly Expenditure</h2>
              <p>£2,000</p>
          </AccountSummaryCard>
          <TotalBalanceCard />
      </div>
  )
}
