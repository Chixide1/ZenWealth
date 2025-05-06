import {Button, ButtonProps} from "@/components/ui/button.tsx";
import { ArrowUpDown } from "lucide-react";
import {cn} from "@/lib/utils.ts";

type ColumnSortingButtonProps = {
    className?: string,
    name: string,
} & Omit<ButtonProps, "className">

export default function ColumnSortingButton({className, name, ...props}: ColumnSortingButtonProps) {
    return(
        <Button
            className={cn("capitalize text-left py-2 pe-3 ps-0 inline-flex items-center group", className)}
            variant="ghost"
            {...props}
        >
            <ArrowUpDown className="h-auto w-4 group-hover:text-secondary duration-500 transition-colors"/>
            <span className="">{name}</span>
        </Button>
    );
}