import { createFileRoute } from '@tanstack/react-router'
import {AccountSummaryCard} from "@/components/features/accounts/AccountSummaryCard.tsx";
import {NetWorthCard} from "@/components/features/accounts/NetWorthCard.tsx";
import {useIsMobile} from "@/hooks/use-mobile.tsx";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";

export const Route = createFileRoute('/_layout/')({
  component: DashboardPage,
})

function DashboardPage() {
    return (
      <div className="grid grid-cols-12 gap-4 px-6 md:px-4 pb-8">
          <AccountSummarySection>
              <AccountSummaryCard dataTitle="Income" amount={2100} previousAmount={1950}/>
              <AccountSummaryCard dataTitle="Expenditure" amount={1500} previousAmount={1900} invert={true}/>
              <AccountSummaryCard dataTitle="Savings" amount={500} previousAmount={627}/>
              <AccountSummaryCard dataTitle="Liabilities" amount={750} previousAmount={543} invert={true}/>
          </AccountSummarySection>
          <NetWorthCard />
      </div>
    )
}

function AccountSummarySection({children}: {children: React.ReactNode}){
    const isMobile = useIsMobile()
    
    if (isMobile){
        return (
            <ScrollArea className="col-span-full">
                <div className="w-full gap-6 flex">
                    {children}
                </div>
                <ScrollBar orientation="horizontal"></ScrollBar>
            </ScrollArea>
        )
    }
    
    return children;
}