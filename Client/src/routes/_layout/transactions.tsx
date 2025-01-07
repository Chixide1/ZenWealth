import { createFileRoute } from '@tanstack/react-router';
import { transactionColumns } from '@/components/features/transactions/TransactionColumns.tsx';
import { TransactionTable } from '@/components/features/transactions/TransactionTable.tsx';
import { useAtom } from 'jotai';
import {transactionsAtom} from "@/lib/atoms.ts";

export const Route = createFileRoute('/_layout/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  const [{data, isLoading}] = useAtom(transactionsAtom);

  return (
      <TransactionTable
          className="animate-fade-in-up"
          columns={transactionColumns}
          data={data}
          isLoading={isLoading}
      />
  )
}
