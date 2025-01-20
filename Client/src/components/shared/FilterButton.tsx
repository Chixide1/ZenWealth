import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import { Filter } from "lucide-react";
import { useState } from "react";
import { Transaction } from "@/types.ts";
import { Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface FilterButtonProps {
    /** The components to render within the dropdown menu */
    children: React.ReactNode;

    /** The Tanstack Table column that this button will be mapped to */
    column: Column<Transaction, unknown>

    /** The className that will be used for the DropdownMenuContent within the DropdownMenu */
    className?: string;

    /** In which position should the DropdownMenu be rendered */
    dropdownAlign?: "center" | "start" | "end";

    /** The modality of the dropdown menu. When set to true, interaction with outside elements will be disabled and only menu content will be visible to screen readers. */
    modal?: boolean;
}

/** This returns a filter button with the column name and a dropdown which can be provided as a child */
export default function FilterButton({children, column, className, dropdownAlign, modal = false}: FilterButtonProps) {
    const [open, setOpen] = useState(false);
    
    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={modal}>
            <DropdownMenuTrigger asChild>
                <Button className={`capitalize px-0.5 focus-visible:ring-0`} variant="ghost">
                    <Filter className={`mt-0.5 transition-colors duration-200 ${open && "text-secondary"}`}/>
                    {column.id}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={cn("w-80 p-4 bg-neutral-700/[0.7] backdrop-blur-sm border-0 text-primary", className)} align={dropdownAlign}>
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}