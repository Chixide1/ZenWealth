import { useState } from "react";
import { Column } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { Transaction } from "@/types";
import FilterButton from "@/components/shared/FilterButton.tsx";

export default function AmountFilterButton({ column }: { column: Column<Transaction, unknown> }) {
    const [values, setValues] = useState<number[]>([0,0]);
    const minValue = column.getFacetedMinMaxValues()?.[0] ?? Number.MIN_SAFE_INTEGER;
    const maxValue = column.getFacetedMinMaxValues()?.[1] ?? Number.MAX_SAFE_INTEGER;

    return (
        <FilterButton column={column}>
            <form
                className="space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    column.setFilterValue({min: values[0], max: values[1]});
                }}
            >
                <div className="flex items-center justify-between">
                    <h4 className="font-medium leading-none">Filter by Amount</h4>
                    <Button
                        className="text-secondary"
                        variant="ghost"
                        size="sm"
                        type="submit"
                        onClick={() => {
                            setValues([minValue, maxValue])
                        }}
                    >
                        Reset
                    </Button>
                </div>
                <DualRangeSlider
                    value={values}
                    onValueChange={setValues}
                    min={minValue}
                    max={maxValue}
                    step={0.01}
                    currencySymbol="£"
                />
                <div
                    className="space-y-4"
                >
                    <div className="flex gap-4">
                        <div className="grow">
                            <Label htmlFor="min-amount">Min £</Label>
                            <Input
                                id="min-amount"
                                type="number"
                                min={minValue}
                                max={maxValue}
                                step={0.01}
                                placeholder={"Min"}
                                value={values?.[0] ?? minValue}
                                onChange={(e) => setValues([Number(e.target.value), values?.[1] ?? maxValue])}
                            />
                        </div>
                        <div className="grow">
                            <Label htmlFor="max-amount">Max £</Label>
                            <Input
                                id="max-amount"
                                type="number"
                                min={minValue}
                                max={maxValue}
                                step={0.01}
                                placeholder={"Max"}
                                value={values?.[1] ?? maxValue}
                                onChange={(e) => setValues([values?.[0] ?? minValue, Number(e.target.value)])}
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full" variant="accent">
                        Apply Filter
                    </Button>
                </div>
            </form>
        </FilterButton>
    );
}

