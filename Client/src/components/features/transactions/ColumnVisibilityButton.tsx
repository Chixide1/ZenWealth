import {useState} from "react";
import {ChevronDown} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Column} from "@tanstack/react-table";
import {Transaction} from "@/types";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function ColumnVisibilityButton({columns}: { columns: Column<Transaction>[] }) {
    "use no memo";
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="accent"
                    className="flex items-center justify-center gap-0.5 h-8"
                    size="sm"
                >
                    <ChevronDown className={`transition-transform duration-300 ${open && "rotate-180"}`}/>
                    Columns
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-accent border-0" align="end">
                {columns
                    .filter((column) => column.getCanHide())
                    .map(column => (
                            <DropdownMenuCheckboxItem
                                key={column.id + "::ColumnVisibilityButtonCheckBox"}
                                className="text-sm capitalize bg-accent focus:bg-black/10 transition-colors duration-200"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => {
                                    column.toggleVisibility(!!value);
                                }
                            }
                            >
                                {column.id}
                            </DropdownMenuCheckboxItem>
                        )
                    )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

