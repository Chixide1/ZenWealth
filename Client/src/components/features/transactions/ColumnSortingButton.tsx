import {Button} from "@/components/core/button.tsx";
import {Column} from "@tanstack/react-table";
import {Transaction} from "@/types";
import { ArrowUpDown } from "lucide-react";

export default function ColumnSortingButton({column}: {column:  Column<Transaction, unknown>}) {
    return(
        <Button
            className="capitalize text-left py-2 px-3 flex items-center ml-auto"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            <ArrowUpDown className="h-auto w-4 mt-0.5"/>
        </Button>
    )
}