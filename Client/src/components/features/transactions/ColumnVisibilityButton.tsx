import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Column} from "@tanstack/react-table";
import {Transaction} from "@/types";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-regular-svg-icons";


export default function ColumnVisibilityButton({columns}: { columns: Column<Transaction>[] }) {
    "use no memo"; // eslint-disable-line
    
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="accent"
                    className="flex items-center gap-1 text-xs justify-center px-2"
                    size="sm"
                >
                    Columns
                    <FontAwesomeIcon
                        icon={faEye}
                    />
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

