import { createFileRoute } from '@tanstack/react-router'
import { useContext } from 'react'
import { transactionColumns } from '@/components/features/transactions/TransactionColumns.tsx'
import { TransactionTable } from '@/components/features/transactions/TransactionTable.tsx'
import { TransactionsContext } from '@/providers/TransactionsProvider'

export const Route = createFileRoute('/_layout/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  const [transactionsData, isLoading] = useContext(TransactionsContext)

  return (
      <TransactionTable
          className="animate-fade-in-up"
          columns={transactionColumns}
          data={transactionsData}
          isLoading={isLoading}
      />
  )
}
