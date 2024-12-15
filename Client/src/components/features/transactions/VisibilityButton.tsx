import {useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {Button} from "../../core/button";
import {Column} from "@tanstack/react-table";
import {Transaction} from "@/components/features/transactions/TransactionsCols.tsx";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/core/dropdown-menu"


export default function VisibilityButton({columns}: { columns: Column<Transaction>[] }) {
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="secondary"
                    className="flex items-center justify-center gap-0.5"
                    size="sm"
                >
                    <ChevronDown className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}/>
                    Columns
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-secondary/90 backdrop-blur-md border-0" align="end">
                {columns
                    .filter((column) => column.getCanHide())
                    .map(column => (
                            <DropdownMenuCheckboxItem
                                key={column.id} className="text-sm capitalize focus:bg-secondary transition-colors duration-200"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                    column.toggleVisibility(!!value)
                                }
                            >
                                {column.id}
                            </DropdownMenuCheckboxItem>
                        )
                    )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

