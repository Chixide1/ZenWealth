import FilterButton from "@/components/shared/FilterButton.tsx";
import {Transaction} from "@/components/features/transactions/TransactionColumns.tsx";
import { Column } from "@tanstack/react-table";
import { DateTimePicker } from "@/components/core/date-time-picker";
import { useState } from "react";


export default function DateFilterButton({column}: { column: Column<Transaction, unknown> }){
    const [date, setDate] = useState<Date | undefined>(undefined);
    
    return (
        <FilterButton column={column}>
            <div>
                <DateTimePicker value={date} onChange={setDate} className="w-[280px]" />
            </div>
        </FilterButton>
    )
}