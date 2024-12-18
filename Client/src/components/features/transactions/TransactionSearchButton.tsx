import { Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import { FloatingInput, FloatingLabel } from "@/components/core/floating-input.tsx";
import { Transaction } from "@/components/features/transactions/TransactionColumns.tsx";
import { Column } from "@tanstack/react-table";

interface TransactionSearchButtonProps {
    className?: string
    column: Column<Transaction, unknown> | undefined
}

export default function TransactionSearchButton({className, column}: TransactionSearchButtonProps) {
    return (
        <div className={cn("relative w-full max-w-sm", className)}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"/>
                <FloatingInput
                    id="searchTransactions"
                    className="pl-9 pr-3 py-2 w-full border-0 ring-0 shadow-none focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none bg-primary/10"
                    value={(column?.getFilterValue() as string) ?? ""}
                    onChange={(event) => column?.setFilterValue(event.target.value)}
                />
                <FloatingLabel
                    htmlFor="searchTransactions"
                    className="bg-transparent left-9 px-0 text-muted-foreground"
                >
                    Search
                </FloatingLabel>
        </div>
    )
}

