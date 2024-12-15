import { createFileRoute } from '@tanstack/react-router'
import axios, { AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import {
  transactionsCols,
  Transaction,
} from '@/components/features/transactions/TransactionsCols.tsx'
import { TransactionsTable } from '@/components/features/transactions/TransactionsTable.tsx'

export const Route = createFileRoute('/_dashboard/')({
  component: HomePage,
})

interface TransactionData {
  transactions: Transaction[]
  total_transactions: number
}

export default function HomePage() {
  const [transactionsData, setTransactionsData] = useState<TransactionData>({
    transactions: [],
    total_transactions: 0,
  })

  useEffect(() => {
    async function getTransactionsData() {
      const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}/api`
      await axios
        .get(`${backend}/GetTransactions`, { withCredentials: true })
        .then((response: AxiosResponse<TransactionData>) => {
          setTransactionsData(response.data)
        })
        .catch((error: AxiosResponse) => {
          console.error('Error occurred', error)
        })
    }
    getTransactionsData()
  }, [])

  console.log(transactionsData)
  return (
      <div className="w-9/12 mx-auto py-6">
        <TransactionsTable
            columns={transactionsCols}
            data={transactionsData.transactions}
        />
      </div>
  )
}
