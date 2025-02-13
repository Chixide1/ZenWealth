import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import { Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type FilterButtonProps = {
    /** The className that will be used for the DropdownMenuContent within the DropdownMenu */
    className?: string;
}

/** This returns a filter button with the column name and a dropdown which can be provided as a child */
export function ColumnFilterButton({className}: FilterButtonProps) {
    const [open, setOpen] = useState(false);
    
    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false} >
            <DropdownMenuTrigger asChild>
                <Button className="capitalize text-xs gap-1 text-black" variant="accent" size="sm">
                    <Filter className="transition-colors duration-200" strokeWidth={1.5} />
                    Filters
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={cn("w-80 p-4 bg-neutral-700/70 backdrop-blur-sm border-0 text-primary", className)} align="end">
                
            </DropdownMenuContent>
        </DropdownMenu>
    );
}