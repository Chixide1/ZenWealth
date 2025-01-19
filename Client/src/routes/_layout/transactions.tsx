import { createFileRoute } from '@tanstack/react-router';
import { transactionColumns } from '@/components/features/transactions/TransactionColumns.tsx';
import { TransactionsHistoryTable } from '@/components/features/transactions/TransactionsHistoryTable.tsx';
import { useAtom } from 'jotai';
import {transactionsAtom} from "@/lib/atoms.ts";
import {useIsMobile} from "@/hooks/use-mobile.tsx";
import {TransactionsHistoryCard} from "@/components/features/transactions/TransactionsHistoryCard.tsx";

export const Route = createFileRoute('/_layout/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  const [{data, isLoading}] = useAtom(transactionsAtom);
  const isMobile = useIsMobile();

  return (
      <div className="px-4 pt-2 pb-6">
          {isMobile ?
              <TransactionsHistoryCard />
              :
              <TransactionsHistoryTable
              className="animate-in slide-in-from-bottom-1/4 duration-300"
              columns={transactionColumns}
              data={data}
              isLoading={isLoading}
          />}
      </div>
  )
}
