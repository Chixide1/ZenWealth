import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent, DropdownMenuSubContent,
    DropdownMenuTrigger
} from "@/components/core/dropdown-menu.tsx";
import {Button} from "@/components/core/button.tsx";
import {Transaction} from "@/components/features/transactions/TransactionsCols.tsx";
import { Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import { Toggle } from "@/components/core/toggle";

export default function CategoryButton({column}: {column:  Column<Transaction, unknown>}){
    const curFilter = column.getFilterValue() as string[] | undefined;
    
    function isFiltered(category: string){
        if(curFilter){
            return !curFilter.includes(category);
        }
        else {
            return true;
        }
    }
    
    // console.log(curFilter)
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="capitalize px-0.5" variant="ghost">
                    <Filter className="mt-0.5"/>
                    {column.id}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-0 bg-neutral-700/[0.7] flex justify-center flex-wrap max-w-sm gap-1 py-3 backdrop-blur-sm" align="center">
                {categories.map(category => (
                    <Toggle
                        className="capitalize data-[state=on]:hover:bg-secondary/[0.2] backdrop-blur-sm data-[state=on]:backdrop-blur-sm data-[state=on]:bg-secondary/[0.3]
                        data-[state=on]:text-secondary data-[state=on]:text-xs text-xs bg-muted/[0.3] text-neutral-300 hover:bg-muted/[0.2] hover:text-neutral-300"
                        key={category + " Toggle"}
                        pressed={isFiltered(category)}
                        onPressedChange={() => {
                            if(!curFilter){
                                column.setFilterValue([`${category}`])
                            }
                            else if(curFilter.includes(category)){
                                const updated = curFilter.filter((item) => item !== category);
                                column.setFilterValue(updated);
                            }
                            else{
                                curFilter.push(category)
                                column.setFilterValue(curFilter)
                            }
                        }}
                    >
                        {category}
                    </Toggle>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const categories = [
    "bank fees",
    "home improvement",
    "rent and utilities",
    "entertainment",
    "income",
    "transfer in",
    "food and drink",
    "loan payments",
    "transfer out",
    "general merchandise",
    "medical",
    "transportation",
    "general services",
    "personal care",
    "travel",
    "government and non profit"
];