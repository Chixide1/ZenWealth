import FilterButton from "@/components/shared/FilterButton.tsx";
import {Transaction} from "@/components/features/transactions/TransactionColumns.tsx";
import { Column } from "@tanstack/react-table";


export default function DateFilterButton({column}: { column: Column<Transaction, unknown> }){
    return (
        <FilterButton column={column}>
            <div></div>
        </FilterButton>
    )
}