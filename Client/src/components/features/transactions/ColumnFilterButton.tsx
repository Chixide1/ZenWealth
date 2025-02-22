import type React from "react";
import { Filter, X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { categories, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAtom } from "jotai";
import { accountsAtom, minMaxAmountAtom, transactionsParamsAtom } from "@/lib/atoms";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import CurrencyInput from "react-currency-input-field";
import type { Account, TransactionFilters } from "@/types";
import Loading from "@/components/shared/Loading.tsx";

type ColumnFilterButtonProps = {
    className?: string
}

type ColumnFilter = {
    type: string
    value: string | number | Date
}

type RenderFilterContentProps = {
    accounts: Account[]
    activeFilter: string
    tempFilters: TransactionFilters
    setTempFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>
}

const filtersMap = new Map([
    ["minAmount", "Minimum Amount"],
    ["maxAmount", "Maximum Amount"],
    ["excludeAccounts", "Accounts"],
    ["excludeCategories", "Categories"],
]);

const tabs = [
    "Amount",
    "Accounts",
    "Categories",
];

export function ColumnFilterButton({ className }: ColumnFilterButtonProps) {
    const [{ data }] = useAtom(accountsAtom);
    const [filters, setFilters] = useAtom(transactionsParamsAtom);
    const accounts = data ?? [];
    const [activeFilter, setActiveFilter] = useState("Amount");
    const [isOpen, setIsOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);

    useEffect(() => {
        if (isOpen) {
            setTempFilters(filters);
        }
    }, [isOpen, filters]);

    const currentFilters = useMemo(() => {
        return Object.entries(tempFilters)
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
            .reduce<(Omit<ColumnFilter, "value"> & { value: string })[]>((acc, item) => {
                if (filtersMap.has(item.type)) {
                    acc.push({ type: filtersMap.get(item.type)!, value: item.value.toString() });
                }
                return acc;
            }, []);
    }, [tempFilters]);

    const handleRemoveFilter = (item: ColumnFilter) => {
        setTempFilters((prev) => {
            const filterKey = Array.from(filtersMap.entries()).find(([, displayName]) => displayName === item.type)?.[0];

            if (!filterKey) return prev;

            if (filterKey === "excludeAccounts") {
                const updatedAccounts = prev.excludeAccounts?.filter((a) => a !== item.value) ?? [];
                return { ...prev, excludeAccounts: updatedAccounts };
            } else if (filterKey === "excludeCategories") {
                const updatedCategories = prev.excludeCategories?.filter((c) => c !== item.value) ?? [];
                return { ...prev, excludeCategories: updatedCategories };
            } else if (filterKey === "minAmount" || filterKey === "maxAmount") {
                return { ...prev, [filterKey]: null };
            }

            return prev;
        });
    };

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setIsOpen(false);
    };

    const handleResetAllFilters = () => {
        setTempFilters({
            ...tempFilters,
            excludeAccounts: [],
            excludeCategories: [],
            minAmount: null,
            maxAmount: null,
        });
    };

    return (
        <DropdownMenu modal={true} open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button className="capitalize text-xs gap-1" variant="accent" size="sm">
                    Filters
                    <Filter className="h-4 w-4" strokeWidth={1.5} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn("w-[45rem] text-primary p-0 bg-neutral-700/90 backdrop-blur-sm border-neutral-600 shadow-lg", className)}
                align="end"
            >
                <div className="grid grid-cols-[12rem,_repeat(2,_minmax(0,_1fr))]">
                    {/* Left Column */}
                    <h2 className="p-4 text-xl border-r border-neutral-600">Filters</h2>
                    <div className="flex flex-col justify-start px-4 bg-transparent gap-1 h-auto border-r border-neutral-600 rounded-none">
                        {tabs.map((name) => (
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
                        <RenderFilterContent
                            activeFilter={activeFilter}
                            accounts={accounts}
                            tempFilters={tempFilters}
                            setTempFilters={setTempFilters}
                        />
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
                                            <p className="text-sm text-neutral-400">
                                                {filter.type}
                                            </p>
                                            <p className="text-white">
                                                {filter.value.replace(/_/g, " ")}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-neutral-400"
                                            onClick={() => handleRemoveFilter(filter)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>

                    {/* Footer */}
                    <div className="col-span-3 border-t border-neutral-600 p-2.5 flex justify-end gap-2">
                        <Button variant="accent" className="" size="sm" onClick={handleResetAllFilters}>
                            Reset all
                        </Button>
                        <Button variant="accent" className="" size="sm" onClick={handleApplyFilters}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function RenderFilterContent({ activeFilter, accounts, tempFilters, setTempFilters }: RenderFilterContentProps) {
    const [{ data: bounds, isLoading }] = useAtom(minMaxAmountAtom);
    const [range, setRange] = useState([0, 0]);

    useEffect(() => {
        if (bounds) {
            setRange([tempFilters.minAmount ?? bounds.min, tempFilters.maxAmount ?? bounds.max]);
        }
    }, [bounds, tempFilters.minAmount, tempFilters.maxAmount]);

    const handleAmountChange = (newRange: [number, number]) => {
        setRange(newRange);
        setTempFilters((prev) => ({
            ...prev,
            minAmount: newRange[0] !== bounds?.min ? newRange[0] : null,
            maxAmount: newRange[1] !== bounds?.max ? newRange[1] : null,
        }));
    };

    const handleAccountToggle = (accountName: string) => {
        setTempFilters((prev) => {
            const excludeAccounts = prev.excludeAccounts || [];
            if (excludeAccounts.includes(accountName)) {
                return {
                    ...prev,
                    excludeAccounts: excludeAccounts.filter((a: string) => a !== accountName),
                };
            } else {
                return {
                    ...prev,
                    excludeAccounts: [...excludeAccounts, accountName],
                };
            }
        });
    };

    const handleCategoryToggle = (category: string) => {
        setTempFilters((prev) => {
            const excludeCategories = prev.excludeCategories || [];
            if (excludeCategories.includes(category)) {
                return {
                    ...prev,
                    excludeCategories: excludeCategories.filter((c: string) => c !== category),
                };
            } else {
                return {
                    ...prev,
                    excludeCategories: [...excludeCategories, category],
                };
            }
        });
    };

    const handleSelectAllAccounts = (checked: boolean) => {
        setTempFilters((prev) => ({
            ...prev,
            excludeAccounts: checked ? [] : accounts.map((account) => account.name),
        }));
    };

    const handleSelectAllCategories = (checked: boolean) => {
        setTempFilters((prev) => ({
            ...prev,
            excludeCategories: checked ? [] : categories,
        }));
    };

    switch (activeFilter) {
    case "Amount":
        if (isLoading) {
            return <Loading fullScreen={false} className="h-52" />;
        }

        return (
            <div className="p-4 h-52">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-sm mb-2 block">From</label>
                        <CurrencyInput
                            id="input-from"
                            name="input-from"
                            placeholder={`Min: £${bounds?.min.toFixed(2)}`}
                            prefix="£"
                            value={range[0]}
                            decimalScale={2}
                            onValueChange={(value) => {
                                handleAmountChange([Number(value), range[1]]);
                            }}
                            className="text-sm w-full p-2 border border-neutral-600 rounded bg-neutral-800/50 text-primary"
                        />
                    </div>
                    <div>
                        <label className="text-sm mb-2 block">To</label>
                        <CurrencyInput
                            id="input-to"
                            name="input-to"
                            placeholder={`Max: £${bounds?.max.toFixed(2)}`}
                            value={range[1]}
                            prefix="£"
                            decimalScale={2}
                            onValueChange={(value) => {
                                handleAmountChange([range[0], Number(value)]);
                            }}
                            className="text-sm w-full p-2 border border-neutral-600 rounded bg-neutral-800/50 text-primary"
                        />
                    </div>
                </div>
                <DualRangeSlider
                    max={bounds?.max ?? 0}
                    min={bounds?.min ?? 0}
                    step={0.1}
                    value={range}
                    onValueChange={handleAmountChange}
                    className="py-4"
                />
            </div>
        );
    case "Accounts":
        return (
            <ScrollArea className="h-52 p-4">
                <div className="flex items-center justify-between mb-5">
                    <label htmlFor="select-all-accounts" className="text-sm font-medium">
                            Select All
                    </label>
                    <Checkbox
                        id="select-all-accounts"
                        onCheckedChange={handleSelectAllAccounts}
                        checked={tempFilters.excludeAccounts.length === 0}
                    />
                </div>
                <ul className="flex flex-col gap-3 text-sm">
                    {accounts.map((account) => (
                        <li
                            key={account.id + "::ColumnFilterButtonAccounts"}
                            className="flex justify-between items-center gap-10"
                        >
                            <p>{account.name}</p>
                            <Checkbox
                                checked={!tempFilters.excludeAccounts?.includes(account.name)}
                                onCheckedChange={() => handleAccountToggle(account.name)}
                                className="data-[state=checked]:bg-secondary"
                            />
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        );
    case "Categories":
        return (
            <ScrollArea className="h-52 p-4">
                <div className="flex items-center justify-between mb-5">
                    <label htmlFor="select-all-categories" className="text-sm font-medium">
                            Select All
                    </label>
                    <Checkbox
                        id="select-all-categories"
                        onCheckedChange={handleSelectAllCategories}
                        checked={tempFilters.excludeCategories.length === 0}
                    />
                </div>
                <ul className="flex flex-col gap-3 text-sm">
                    {categories.map((category) => (
                        <li
                            key={category + "::ColumnFilterButtonCategories"}
                            className="flex justify-between items-center gap-10"
                        >
                            <p>{category.replace(/_/g, " ")}</p>
                            <Checkbox
                                checked={!tempFilters.excludeCategories?.includes(category)}
                                onCheckedChange={() => handleCategoryToggle(category)}
                                className="data-[state=checked]:bg-secondary"
                            />
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        );
    default:
        return null;
    }
}

