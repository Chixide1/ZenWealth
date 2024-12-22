import {Label} from "@/components/core/label.tsx";
import {Input} from "@/components/core/input.tsx";
import {Transaction} from "@/components/features/transactions/TransactionColumns.tsx";
import { Column } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionSearchButtonProps {
    className?: string
    column: Column<Transaction, unknown> | undefined
}

export default function TransactionSearchButton({className, column}: TransactionSearchButtonProps) {
    return (
        <div className={cn("relative w-full max-w-sm", className)}>
            <Label htmlFor="searchTransactions"
                   className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 text-muted-foreground"/>
            </Label>
            <Input
                id="searchTransactions"
                placeholder="Search"
                value={(column?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    column?.setFilterValue(event.target.value)
                }
                className="pl-10 border-0 ring-0 shadow-none focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none bg-primary/[0.09] h-[2.085rem]"
            />
        </div>
    )
}