import {Button} from "@/components/core/button.tsx";
import {Column} from "@tanstack/react-table";
import {Transaction} from "@/components/features/transactions/TransactionsCols.tsx";
import { ArrowUpDown } from "lucide-react";

export default function ColHeader({column}: {column:  Column<Transaction, unknown>}) {
    return(
        <Button
            className="capitalize text-left p-0 flex items-center"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {column.id}
            <ArrowUpDown className="h-4 w-4 mt-0.5"/>
        </Button>
    )
}