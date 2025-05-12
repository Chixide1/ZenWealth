import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {transactionsParamsAtom} from "@/lib/atoms.ts";

interface TransactionSearchButtonProps {
    className?: string
}

export default function TransactionSearchButton({className}: TransactionSearchButtonProps) {
    const [inputValue, setInputValue] = useState("");
    const [filters, setFilters] = useAtom(transactionsParamsAtom);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters({
                ...filters,
                name: inputValue,
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, [inputValue]);
    
    return (
        <div className={cn("relative w-full max-w-64", className)}>
            <Label htmlFor="searchTransactions"
                className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 text-neutral-400"/>
            </Label>
            <Input
                id="searchTransactions"
                placeholder="Search..."
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                className="placeholder:text-neutral-400 text-primary pl-10 border-0 focus-visible:ring-1 !ring-primary/30 bg-background h-8"
            />
        </div>
    );
}