"use client";

import { Filter, X } from "lucide-react";
import { useState } from "react";
import { categories, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAtom } from "jotai";
import { accountsAtom, transactionsParamsAtom } from "@/lib/atoms";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import CurrencyInput from "react-currency-input-field";

type ColumnFilterButtonProps = {
    className?: string
}

type ColumnFilter = {
    type: string
    value: string | number | Date
}

const filtersMap = new Map([
    ["minAmount", "Amount"],
    ["excludeAccounts", "Accounts"],
    ["excludeCategories", "Categories"],
]);

export function ColumnFilterButton({ className }: ColumnFilterButtonProps) {
    const [range, setRange] = useState([-3000, 6700]);
    const [{ data }] = useAtom(accountsAtom);
    const [filters, setFilters] = useAtom(transactionsParamsAtom);
    const accounts = data ?? [];
    const [activeFilter, setActiveFilter] = useState("Amount");

    const currentFilters = Object.entries(filters)
        .flatMap<ColumnFilter>(([key, value]) => {
            if (Array.isArray(value)) {
                return value.map((item) => ({
                    type: key,
                    value: item,
                }));
            } else if (value !== null) {
                return [{ type: key, value: value }];
            } else {
                return [];
            }
        })
        .reduce<ColumnFilter[]>((acc, item) => {
            if (filtersMap.has(item.type)) {
                acc.push({ type: filtersMap.get(item.type)!, value: item.value });
            }
            return acc;
        }, []);

    const renderFilterContent = () => {
        switch (activeFilter) {
            case "Amount":
                return (
                    <div className="p-4 h-52">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-sm mb-2 block">From</label>
                                <CurrencyInput
                                    id="input-from"
                                    name="input-from"
                                    placeholder="Enter Minimum Amount"
                                    prefix="£"
                                    value={range[0].toString()}
                                    decimalScale={2}
                                    onValueChange={(value) => {
                                        setRange([Number(value), range[1]]);
                                    }}
                                    className="text-sm w-full p-2 border border-neutral-600 rounded bg-neutral-800/50 text-primary"
                                />
                            </div>
                            <div>
                                <label className="text-sm mb-2 block">To</label>
                                <CurrencyInput
                                    id="input-to"
                                    name="input-to"
                                    placeholder="Enter Maximum Amount"
                                    value={range[1]}
                                    prefix="£"
                                    decimalScale={2}
                                    onValueChange={(value) => {
                                        setRange([range[0], Number(value)]);
                                    }}
                                    className="text-sm w-full p-2 border border-neutral-600 rounded bg-neutral-800/50 text-primary"
                                />
                            </div>
                        </div>
                        <DualRangeSlider
                            max={10000}
                            min={-3000}
                            step={0.1}
                            value={range}
                            onValueChange={setRange}
                            className="py-4"
                        />
                    </div>
                );
            case "Accounts":
                return (
                    <ScrollArea className="h-52 p-4">
                        <ul className="flex flex-col gap-3 text-sm">
                            {accounts.map((account) => (
                                <li
                                    key={account.id + "::ColumnFilterButtonAccounts"}
                                    className="flex justify-between items-center gap-10"
                                >
                                    <p>{account.name}</p>
                                    <Checkbox value={account.name} className="data-[state=checked]:bg-secondary" />
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                );
            case "Categories":
                return (
                    <ScrollArea className="h-52 p-4">
                        <ul className="flex flex-col gap-3 text-sm">
                            {categories.map((category) => (
                                <li
                                    key={category + "::ColumnFilterButtonCategories"}
                                    className="flex justify-between items-center gap-10"
                                >
                                    <p>{category}</p>
                                    <Checkbox value={category} className="data-[state=checked]:bg-secondary" />
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                );
            default:
                return null;
        }
    };

    return (
        <DropdownMenu modal={true}>
            <DropdownMenuTrigger asChild>
                <Button className="capitalize text-xs gap-1" variant="accent" size="sm">
                    Filters
                    <Filter className="h-4 w-4" strokeWidth={1.5} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn("w-[45rem] text-primary p-0 bg-neutral-700/90 backdrop-blur-sm border-0", className)}
                align="end"
            >
                <div className="grid grid-cols-[12rem,_repeat(2,_minmax(0,_1fr))]">
                    {/* Left Column */}
                    <h2 className="p-4 text-xl border-r border-neutral-600">Filters</h2>
                    <div className="flex flex-col justify-start px-4 bg-transparent gap-1 h-auto border-r border-neutral-600 rounded-none">
                        {Array.from(filtersMap.values()).map((name) => (
                            <Button
                                key={name + "::ColumnFilterButtonTabs"}
                                onClick={() => setActiveFilter(name)}
                                className={cn(
                                    "capitalize text-neutral-400 py-2 w-full rounded-sm hover:bg-background bg-inherit justify-start",
                                    activeFilter === name && "bg-background text-white",
                                )}
                                variant="ghost"
                            >
                                {name}
                            </Button>
                        ))}
                    </div>

                    {/* Middle Column */}
                    <div className="m-0 h-full grid grid-rows-subgrid row-start-1 col-start-2 row-span-2">
                        <h3 className="text-sm inline-flex items-center p-4 border-b border-neutral-600">
                            {activeFilter === "Amount" ? "Set Amount Range" : `Choose ${activeFilter}:`}
                        </h3>
                        {renderFilterContent()}
                    </div>

                    {/* Right Column */}
                    <div className="grid grid-rows-subgrid col-start-3 row-start-1 row-span-2 border-l border-neutral-600">
                        <h2 className="inline-flex items-center text-sm p-4 border-b border-neutral-600">
                            {currentFilters.length} filters selected:
                        </h2>
                        <ScrollArea className="h-52 p-4">
                            <ul className="flex flex-col gap-3 text-sm">
                                {currentFilters.map((filter, index) => (
                                    <div
                                        key={filter.type + index + "::ColumnFilterButtonCurrentFilters"}
                                        className="flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="text-sm text-neutral-400">{filter.type}</div>
                                            <div className="text-white">{filter.value.toString()}</div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-neutral-400"
                                            // onClick={() => setFilters({
                                            //     ...filters,
                                            //     [filter.type]: 
                                            // })}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>

                    {/* Footer */}
                    <div className="col-span-3 border-t border-neutral-600 p-4 flex justify-end gap-2">
                        <Button
                            variant="outline"
                            className=""
                            size="sm"
                            onClick={() => setFilters({
                                ...filters,
                                excludeAccounts: null,
                                excludeCategories: null,
                                minAmount: null,
                                maxAmount: null,
                            })}
                        >
                            Reset all
                        </Button>
                        <Button className="" variant="accent" size="sm">
                            Apply
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

