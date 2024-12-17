import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/core/dropdown-menu.tsx";
import {Button} from "@/components/core/button.tsx";
import {Transaction} from "@/components/features/transactions/TransactionColumns.tsx";
import { Column } from "@tanstack/react-table";
import { Filter } from 'lucide-react';
import { useEffect, useState } from "react";
import {DualRangeSlider} from "@/components/core/dual-range-slider.tsx";

export default function AmountFilterButton({column, minMax}: {column: Column<Transaction, unknown>, minMax: [number, number]}) {
    const [open, setOpen] = useState(false)
    const [values, setValues] = useState<[number, number]>();

    // useEffect(() => {
    //     const vals = column.getFacetedMinMaxValues();
    //     if (vals) {
    //         setMinMaxVals(vals as [number, number]);
    //         setValues(vals as [number, number]);
    //     }
    //     console.log(vals)
    // }, []);
    //
    // // function isFiltered(category: string){
    // //     return curFilter[category]
    // // }
    //
    // console.log(minMaxVals);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button className={`capitalize px-0.5 focus-visible:ring-0`} variant="ghost">
                    <Filter className={`mt-0.5 transition-colors duration-200 ${open && "text-secondary"}`}/>
                    {column.id}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-0 bg-neutral-700/[0.7] flex justify-center flex-wrap w-[21rem] gap-1 py-3 backdrop-blur-sm" align="center">
                <div className="w-full pt-10 px-10">
                    <DualRangeSlider
                        label={(value) => `$${value}`}
                        value={values}
                        defaultValue={minMax}
                        onValueChange={setValues}
                        min={minMax[0]}
                        max={minMax[1]}
                        step={10}
                    />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

