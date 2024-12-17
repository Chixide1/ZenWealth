import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/core/dropdown-menu.tsx";
import {Button} from "@/components/core/button.tsx";
import {Transaction} from "@/components/features/transactions/TransactionColumns.tsx";
import { Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import { Toggle } from "@/components/core/toggle";
import { useState } from "react";

export default function CategoryFilterButton({column}: {column:  Column<Transaction, unknown>}){
    const curFilter = column.getFilterValue() as Record<string, boolean>;
    const [open, setOpen] = useState(false)
    
    function isFiltered(category: string){
        return curFilter[category]
    }
    
    // console.log(column.getFacetedUniqueValues())
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button className={`capitalize px-0.5 focus-visible:ring-0`} variant="ghost">
                    <Filter className={`mt-0.5 transition-colors duration-200 ${open && "text-secondary"}`}/>
                    {column.id}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-0 bg-neutral-700/[0.7] flex justify-center flex-wrap max-w-[21rem] gap-1 py-3 backdrop-blur-sm" align="center">
                {Array.from<string, string>(column.getFacetedUniqueValues().keys(), (c) => c.toLowerCase())
                    .sort()
                    .map(category => (
                        <Toggle
                            className="capitalize data-[state=on]:hover:bg-secondary/[0.2] backdrop-blur-sm data-[state=on]:backdrop-blur-sm data-[state=on]:bg-secondary/[0.3]
                            data-[state=on]:text-secondary data-[state=on]:text-xs text-xs bg-muted/[0.3] text-neutral-300 hover:bg-muted/[0.2] hover:text-neutral-300"
                            key={category + " Toggle"}
                            pressed={isFiltered(category)}
                            onPressedChange={() => {
                                const updated = curFilter
                                updated[category] = !updated[category];
                                column.setFilterValue(updated)
                            }}
                        >
                            {category}
                        </Toggle>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}