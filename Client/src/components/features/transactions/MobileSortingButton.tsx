import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import {resetPaginationAtom, transactionsParamsAtom} from "@/lib/atoms";
import { useAtom } from "jotai";

type SortingOption = {
    name: string,
    value: string,
}

const sortingOptions: SortingOption[] = [
    {name: "Date Descending", value: "date-desc"},
    {name: "Date Ascending", value: "date-asc"},
    {name: "Amount Descending", value: "amount-desc"},
    {name: "Amount Ascending", value: "amount-asc"},
];

export function MobileSortingButton(){
    const [isOpen, setIsOpen] = useState(false);
    const [{sort}, setParams] = useAtom(transactionsParamsAtom);
    const [, resetPagination] = useAtom(resetPaginationAtom);
    
    return (
        <DropdownMenu modal={true} open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button className="gap-1 text-xs capitalize p-2" variant="accent" size="sm">
                    <span className="hidden md:inline">Date</span>
                    <ArrowUpDown className="h-4 w-4" strokeWidth={1.5} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn("w-auto text-primary bg-neutral-700/90 backdrop-blur-sm border-neutral-600 p-2 space-y-1")}
                align="end"
            >
                {sortingOptions.map((option) => (
                    <DropdownMenuItem
                        aria-selected={option.value === sort}
                        className="text-neutral-400 aria-selected:text-primary aria-selected:bg-background transition-colors duration-400"
                        key={"MobileSortingButton::" + option.name}
                        onClick={() => {
                            setParams((prev) => ({ ...prev, sort: option.value }));
                            resetPagination();
                            setIsOpen(false);
                        }}
                    >
                        {option.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}