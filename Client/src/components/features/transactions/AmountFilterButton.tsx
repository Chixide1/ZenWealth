import { useState } from "react";
import { Filter } from 'lucide-react';
import { Column } from "@tanstack/react-table";

import { Button } from "@/components/core/button";
import { Input } from "@/components/core/input";
import { Label } from "@/components/core/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/core/dropdown-menu";
import { DualRangeSlider } from "@/components/core/dual-range-slider";

import { Transaction } from "@/components/features/transactions/TransactionColumns";

export default function AmountFilterButton({ column }: { column: Column<Transaction, unknown> }) {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<number[]>([Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY]);

    const minValue = column.getFacetedMinMaxValues()?.[0] ?? 0;
    const maxValue = column.getFacetedMinMaxValues()?.[1] ?? 100;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button className={`capitalize px-0.5 focus-visible:ring-0`} variant="ghost">
                    <Filter className={`mt-0.5 transition-colors duration-200 ${open && "text-secondary"}`}/>
                    {column.id}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-4 bg-neutral-700/[0.7] backdrop-blur-sm border-0 text-primary">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium leading-none">Filter by Amount</h4>
                        <Button 
                            className="text-secondary"
                            variant="ghost"
                            size="sm"
                            onClick={() => setValues([minValue, maxValue])}
                        >
                            Reset
                        </Button>
                    </div>
                    <DualRangeSlider
                        value={values}
                        defaultValue={[minValue, maxValue]}
                        onValueChange={setValues}
                        min={minValue}
                        max={maxValue}
                        step={10}
                        currencySymbol="£"
                    />
                    <form
                        className="space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            column.setFilterValue([values]);
                        }}
                    >
                        <div className="flex gap-4">
                            <div className="grow">
                                <Label htmlFor="min-amount">Min</Label>
                                <Input
                                    id="min-amount"
                                    type="number"
                                    min={minValue}
                                    max={maxValue}
                                    placeholder={`£${minValue}`}
                                    value={values?.[0]}
                                    onChange={(e) => setValues([Number(e.target.value), values?.[1] ?? maxValue])}
                                />
                            </div>
                            <div className="grow">
                                <Label htmlFor="max-amount">Max</Label>
                                <Input
                                    id="max-amount"
                                    type="number"
                                    min={minValue}
                                    max={maxValue}
                                    placeholder={`£${maxValue}`}
                                    value={values?.[1]}
                                    onChange={(e) => setValues([values?.[0] ?? minValue, Number(e.target.value)])}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" variant="accent">
                            Apply Filter
                        </Button>
                    </form>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

