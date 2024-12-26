﻿import { createFileRoute } from '@tanstack/react-router'
import {useContext } from 'react'
import { transactionColumns } from '@/components/features/transactions/TransactionColumns.tsx'
import { TransactionTable } from '@/components/features/transactions/TransactionTable.tsx'
import { TransactionsContext } from '@/providers/TransactionsProvider'

export const Route = createFileRoute('/_layout/')({
  component: HomePage,
})

function HomePage() {
  const [transactionsData, isLoading] = useContext(TransactionsContext)
    
  return (
      <div className="px-4">
        <TransactionTable
            columns={transactionColumns}
            data={transactionsData?.transactions}
            isLoading={isLoading}
        />
      </div>
  )
}
