import { createFileRoute } from '@tanstack/react-router';
import { transactionColumns } from '@/components/features/transactions/TransactionColumns.tsx';
import { TransactionsTable } from '@/components/features/transactions/TransactionsTable.tsx';
import { useAtom } from 'jotai';
import {transactionsAtom, transactionsPaginationAtom} from "@/lib/atoms.ts";
import {useIsMobile} from "@/hooks/use-mobile.tsx";
import {TransactionsCard} from "@/components/features/transactions/TransactionsCard.tsx";

export const Route = createFileRoute('/_layout/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  const [{data, isLoading}] = useAtom(transactionsAtom);
  const [pagination] = useAtom(transactionsPaginationAtom)
  const isMobile = useIsMobile();
  console.log(data)

  return (
      <div className="w-dvw px-3 md:px-4 pt-2 pb-6">
          {isMobile ?
              <TransactionsCard
                  transactions={data?.pages[pagination.pageIndex] ?? []}
                  className=""
                  title="Transactions History"
                  allFeatures={true}
              />
              :
              <TransactionsTable
                className="animate-in slide-in-from-bottom-1/4 duration-300"
                columns={transactionColumns}
                data={data?.pages[pagination.pageIndex] ?? []}
                isLoading={isLoading}
              />
          }
      </div>
  )
}
