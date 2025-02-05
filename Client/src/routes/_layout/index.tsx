import { createFileRoute } from '@tanstack/react-router'
import {MonthlyTransactionsWidget} from "@/components/features/transactions/MonthlyTransactionsWidget.tsx";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import {RecentTransactionsCard} from "@/components/features/transactions/RecentTransactionsCard.tsx";
import {BudgetLimitCard} from "@/components/features/budgets/BudgetLimitCard.tsx";
import {cn} from "@/lib/utils.ts";
import {accountsAtom} from "@/lib/atoms.ts";
import {useAtom} from "jotai";
import {IncomeOutcomeLineGraph} from "@/components/features/transactions/IncomeOutcomeLineGraph.tsx";
import TopExpenseCategoriesCard from "@/components/features/transactions/TopExpenseCategoriesCard.tsx";
import TotalLiabilitiesCard from "@/components/features/accounts/TotalLiabilitiesCard.tsx";
import api from "@/lib/api.ts";
import {MonthlySummary, RecentTransactions, TopExpenseCategory} from "@/types.ts";
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {MonthlyAccountsWidget} from "@/components/features/accounts/MonthlyAccountsWidget.tsx";

export const Route = createFileRoute('/_layout/')({
  component: DashboardPage,
})

function DashboardPage() {
    const [{data: accounts}] = useAtom(accountsAtom);
    const {data: monthlySummaryData}  = useQuery({
        queryKey: ['monthlySummary'],
        queryFn: async () => {
            const response = await api<MonthlySummary[]>("Charts/MonthlySummary")
                .catch((e: AxiosError<MonthlySummary[]>) => console.error(e));

            return response ? response.data : [];
        }
    })
    const {data: recentTransactions}  = useQuery({
        queryKey: ['recentTransactions'],
        queryFn: async () => {
            const response = await api<RecentTransactions>("Charts/RecentTransactions")
                .catch((e: AxiosError<RecentTransactions>) => console.error(e));

            return response ? response.data : {all: [], income: [], expenditure: []};
        }
    })
    const {data: topExpenseCategories}  = useQuery({
        queryKey: ['topExpenseCategories'],
        queryFn: async () => {
            const response = await api<TopExpenseCategory[]>("Charts/TopExpenseCategories")
                .catch((e: AxiosError<TopExpenseCategory>) => console.error(e));

            return response ? response.data : [];
        }
    })
    
    return (
      <div className="grid grid-cols-12 auto-rows-auto gap-4 px-3 md:px-4 pb-8">
          <AccountSummarySection className="col-span-full">
              <MonthlyAccountsWidget title="Total Balance" amount={500}/>
              <MonthlyTransactionsWidget
                  title="Total Expenditure"
                  amount={monthlySummaryData?.[monthlySummaryData?.length - 1]?.expenditure ?? 0}
                  previousAmount={ monthlySummaryData?.[monthlySummaryData?.length - 2]?.expenditure ?? 0}
                  invert={true}
              />
              <MonthlyAccountsWidget title="Total Savings" amount={4300}/>
              <MonthlyTransactionsWidget
                  title="Total Income"
                  amount={monthlySummaryData?.[monthlySummaryData?.length - 1]?.income ?? 0}
                  previousAmount={monthlySummaryData?.[monthlySummaryData?.length - 2]?.income ?? 0}
              />
          </AccountSummarySection>
          <IncomeOutcomeLineGraph data={monthlySummaryData ?? []} className="col-span-full md:col-span-7"/>
          <RecentTransactionsCard
              recentTransactions={recentTransactions}
              className="col-span-full md:col-span-5 row-span-2" 
          />
          <BudgetLimitCard spent={2000} limit={7000} className="col-span-full md:col-span-7"/>
          <TopExpenseCategoriesCard gaugeData={topExpenseCategories ?? []} className="col-span-full md:col-span-5" />
          <TotalLiabilitiesCard accounts={accounts ?? []} className="col-span-full md:col-span-7"/>
      </div>
    )
}

function AccountSummarySection({children, className}: {children: React.ReactNode, className?: string}) {
    return (
        <ScrollArea className={cn("",className)}>
            <div className="w-full  gap-6 flex">
                {children}
            </div>
            <ScrollBar orientation="horizontal"></ScrollBar>
        </ScrollArea>
    )
    
}