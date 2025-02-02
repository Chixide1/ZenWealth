import { createFileRoute } from '@tanstack/react-router'
import {AccountSummaryCard} from "@/components/features/accounts/AccountSummaryCard.tsx";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import {TransactionsCard} from "@/components/features/transactions/TransactionsCard.tsx";
import {BudgetLimitCard} from "@/components/features/budgets/BudgetLimitCard.tsx";
import {cn} from "@/lib/utils.ts";
import {accountsAtom, transactionsAtom, transactionsPaginationAtom} from "@/lib/atoms.ts";
import {useAtom} from "jotai";
import {MonthlyComparisonLineGraph} from "@/components/features/accounts/MonthlyComparisonLineGraph.tsx";
import TopExpenseCategoriesCard, { GaugeProps } from "@/components/features/transactions/TopExpenseCategoriesCard.tsx";
import TotalBalanceCard from "@/components/features/accounts/TotalBalanceCard.tsx";
import api from "@/lib/api.ts";
import {MonthlySummary} from "@/types.ts";
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const Route = createFileRoute('/_layout/')({
  component: DashboardPage,
})

function DashboardPage() {
    const [{data: transactionsData}] = useAtom(transactionsAtom);
    const [{data: accounts}] = useAtom(accountsAtom);
    const {data: monthlySummaryData}  = useQuery({
        queryKey: ['monthlySummary'],
        queryFn: async () => {
            const response = await api<MonthlySummary[]>("Charts/MonthlySummary")
                .catch((e: AxiosError<MonthlySummary[]>) => console.error(e));

            return response ? response.data : [];
        }
    })
    const [pagination] = useAtom(transactionsPaginationAtom)
    
    const transactions = transactionsData?.pages[pagination.pageIndex];

    const gaugeData: GaugeProps[] = [
        {
            categoryName: 'Bank Fees',
            categoryIconUrl: "https://plaid-category-icons.plaid.com/PFC_BANK_FEES.png",
            categoryAmount: 12000,
            totalAmount: 20000,
        },
        {
            categoryName: 'General Services',
            categoryIconUrl: "https://plaid-category-icons.plaid.com/PFC_GENERAL_SERVICES.png",
            categoryAmount: 8500,
            totalAmount: 10000,
        },
        {
            categoryName: 'Entertainment',
            categoryIconUrl: "https://plaid-category-icons.plaid.com/PFC_ENTERTAINMENT.png",
            categoryAmount: 350,
            totalAmount: 500,
        },
    ];
    console.log(monthlySummaryData)
    
    return (
      <div className="grid grid-cols-12 auto-rows-auto gap-4 px-3 md:px-4 pb-8">
          <AccountSummarySection className="col-span-full">
              <AccountSummaryCard
                  dataTitle="Income"
                  amount={monthlySummaryData ? monthlySummaryData[0].income : 0}
                  previousAmount={monthlySummaryData ? monthlySummaryData[2].income : 0}
              />
              <AccountSummaryCard
                  dataTitle="Expenditure"
                  amount={monthlySummaryData ? monthlySummaryData[0].expenditure : 0}
                  previousAmount={monthlySummaryData ? monthlySummaryData[1].expenditure : 0}
                  invert={true}
              />
              <AccountSummaryCard dataTitle="Savings" amount={500} previousAmount={627}/>
              <AccountSummaryCard dataTitle="Liabilities" amount={750} previousAmount={543} invert={true}/>
          </AccountSummarySection>
          <MonthlyComparisonLineGraph data={monthlySummaryData ?? []} className="col-span-full md:col-span-7"/>
          <TransactionsCard
              transactionsData={transactions}
              title="Recent Transactions"
              className="col-span-full md:col-span-5 row-span-2" 
          />
          <BudgetLimitCard spent={2000} limit={7000} className="col-span-full md:col-span-7"/>
          <TopExpenseCategoriesCard gaugeData={gaugeData} className="col-span-full md:col-span-5" />
          <TotalBalanceCard accounts={accounts ?? []} className="col-span-full md:col-span-7"/>
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