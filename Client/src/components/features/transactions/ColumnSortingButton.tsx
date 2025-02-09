import {Button, ButtonProps} from "@/components/ui/button.tsx";
import { ArrowUpDown } from "lucide-react";
import {cn} from "@/lib/utils.ts";

type ColumnSortingButtonProps = {
    className?: string,
} & Omit<ButtonProps, "className">

export default function ColumnSortingButton({className, ...props}: ColumnSortingButtonProps) {
    return(
        <Button
            className={cn("capitalize text-left py-2 px-3 flex items-center ml-auto", className)}
            variant="ghost"
            {...props}
        >
            <ArrowUpDown className="h-auto w-4 mt-0.5"/>
        </Button>
    )
}