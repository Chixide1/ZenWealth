import type React from "react";
import { useEffect, useState } from "react";
import { ChevronDown, Filter, X } from "lucide-react";
import { categoryMap, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import { useAtom } from "jotai";
import { accountsAtom, minMaxAmountAtom, transactionsParamsAtom } from "@/lib/atoms";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import CurrencyInput from "react-currency-input-field";
import type { Account, TransactionParams } from "@/types";
import Loading from "@/components/shared/Loading";
import { useIsMobile } from "@/hooks/use-mobile";

// =========================
// Types
// =========================

type FilterType = "Amount" | "Accounts" | "Categories"
type ColumnFilter = { type: string; value: string | number | Date }
type FilterContentProps = {
    activeFilter: FilterType
    accounts: Account[]
    tempFilters: TransactionParams
    setTempFilters: React.Dispatch<React.SetStateAction<TransactionParams>>
    onClose?: () => void
}

// =========================
// Constants
// =========================

const FILTER_TABS: FilterType[] = ["Amount", "Accounts", "Categories"];
const FILTERS_MAP = new Map([
    ["minAmount", "Minimum Amount"],
    ["maxAmount", "Maximum Amount"],
    ["excludeAccounts", "Accounts"],
    ["excludeCategories", "Categories"],
]);

// =========================
// Utility Functions
// =========================

const filtersParser = (filters: TransactionParams) => (Object.entries(filters)
    .flatMap<ColumnFilter>(([key, value]) => {
        if (Array.isArray(value)) {
            return value.map((item) => ({ type: key, value: item }));
        }
        return value !== null ? [{ type: key, value }] : [];
    })
    .reduce<(Omit<ColumnFilter, "value"> & { value: string })[]>((acc, item) => {
        if (FILTERS_MAP.has(item.type)) {
            acc.push({
                type: FILTERS_MAP.get(item.type)!,
                value: item.value.toString(),
            });
        }
        return acc;
    }, [])
);

// =========================
// Filter Content Components
// ==========================

const AmountFilter = ({
    bounds,
    range,
    onRangeChange,
}: {
    bounds: { min: number; max: number } | undefined
    range: [number, number]
    onRangeChange: (range: [number, number]) => void
}) => (
    <div className="p-3 h-52">
        <div className="grid grid-cols-2 gap-3 mb-4">
            {["From", "To"].map((label, index) => (
                <div key={label + index + "AmountFilter"}>
                    <label className="text-sm mb-2 block text-start">{label}</label>
                    <CurrencyInput
                        id={`input-${label.toLowerCase()}`}
                        name={`input-${label.toLowerCase()}`}
                        placeholder={`${label === "From" ? "Min" : "Max"}: £${bounds?.[label === "From" ? "min" : "max"].toFixed(
                            2,
                        )}`}
                        prefix="£"
                        value={range[index]}
                        decimalScale={2}
                        onValueChange={(value) =>
                            onRangeChange(index === 0 ? [Number(value), range[1]] : [range[0], Number(value)])
                        }
                        className="text-sm w-full p-2 border border-neutral-600 rounded bg-neutral-800/50 text-primary"
                    />
                </div>
            ))}
        </div>
        <DualRangeSlider
            max={bounds?.max ?? 0}
            min={bounds?.min ?? 0}
            step={0.1}
            value={range}
            onValueChange={onRangeChange}
            className="py-4"
        />
    </div>
);

const CheckboxList = ({
    items,
    selectedItems,
    onItemToggle,
    onSelectAll,
    formatLabel = (item: string) => item.replace(/_/g, " "),
}: {
    items: string[]
    selectedItems: string[]
    onItemToggle: (item: string) => void
    onSelectAll: (checked: boolean) => void
    formatLabel?: (item: string) => string
}) => (
    <ScrollArea className="h-52 px-3">
        <div className="flex items-center justify-between mt-3 mb-5">
            <label className="text-sm font-medium">Select All</label>
            <Checkbox onCheckedChange={onSelectAll} checked={selectedItems.length === 0} />
        </div>
        <ul className="flex flex-col gap-3 text-sm">
            {items.map((item, index) => (
                <li key={`${item}-${index}` + "::CheckboxList"} className="last:mb-3 flex justify-between items-center gap-10">
                    <p>{formatLabel(item)}</p>
                    <Checkbox
                        checked={!selectedItems.includes(item)}
                        onCheckedChange={() => onItemToggle(item)}
                        className="data-[state=checked]:bg-secondary"
                    />
                </li>
            ))}
        </ul>
    </ScrollArea>
);

// =========================
// Main Filter Content Component
// =========================

function FilterContent({ activeFilter, accounts, tempFilters, setTempFilters }: FilterContentProps) {
    const [{ data: bounds, isLoading }] = useAtom(minMaxAmountAtom);
    const [range, setRange] = useState<[number, number]>([0, 0]);

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

    if (activeFilter === "Amount") {
        return isLoading ? (
            <Loading fullScreen={false} className="h-52" />
        ) : (
            <AmountFilter bounds={bounds} range={range} onRangeChange={handleAmountChange} />
        );
    }

    const items = activeFilter === "Accounts" ? accounts.map((a) => a.name) : Array.from(categoryMap.keys());
    const selectedItems = activeFilter === "Accounts" ? tempFilters.excludeAccounts : tempFilters.excludeCategories;

    const handleToggle = (item: string) => {
        const key = activeFilter === "Accounts" ? "excludeAccounts" : "excludeCategories";
        setTempFilters((prev) => {
            const current = prev[key] || [];
            return {
                ...prev,
                [key]: current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item],
            };
        });
    };

    const handleSelectAll = (checked: boolean) => {
        const key = activeFilter === "Accounts" ? "excludeAccounts" : "excludeCategories";
        setTempFilters((prev) => ({
            ...prev,
            [key]: checked ? [] : items,
        }));
    };

    return (
        <CheckboxList
            items={items}
            selectedItems={selectedItems}
            onItemToggle={handleToggle}
            onSelectAll={handleSelectAll}
        />
    );
}

// =========================
// Main Component
// =========================

export function ColumnFilterButton({
    className,
}: {
    className?: string
}) {
    const [{ data }] = useAtom(accountsAtom);
    const [filters, setFilters] = useAtom(transactionsParamsAtom);
    const [activeFilter, setActiveFilter] = useState<FilterType>("Amount");
    const [isOpen, setIsOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (isOpen) setTempFilters(filters);
    }, [isOpen, filters]);

    const currentFilters = filtersParser(tempFilters);
    const appliedFilters = filtersParser(filters);

    const handleRemoveFilter = (filter: ColumnFilter) => {
        setTempFilters((prev) => {
            const filterKey = Array.from(FILTERS_MAP.entries()).find(([, displayName]) => displayName === filter.type)?.[0];
            if (!filterKey) return prev;

            if (filterKey === "excludeAccounts" || filterKey === "excludeCategories") {
                // Explicitly type the key to ensure type safety
                const key = filterKey as "excludeAccounts" | "excludeCategories";
                const current = prev[key] || []; // Handle potential undefined case
                return {
                    ...prev,
                    [key]: current.filter((item) => item !== filter.value),
                };
            } else if (filterKey === "minAmount" || filterKey === "maxAmount") {
                // Explicitly type the key for amount filters
                const key = filterKey as "minAmount" | "maxAmount";
                return {
                    ...prev,
                    [key]: null,
                };
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

    const FilterWrapper = isMobile ? Dialog : DropdownMenu;
    const FilterTrigger = isMobile ? DialogTrigger : DropdownMenuTrigger;
    const FilterContainer = isMobile ? DialogContent : DropdownMenuContent;

    return (
        <FilterWrapper open={isOpen} onOpenChange={setIsOpen}>
            <FilterTrigger asChild>
                <Button className="capitalize text-xs gap-1 px-2 md:px-3" variant="accent" size="sm">
                    <span className="hidden md:inline">Filters {appliedFilters.length > 0 && `(${appliedFilters.length})`}</span>
                    <Filter className="h-4 w-4" strokeWidth={1.5} />
                </Button>
            </FilterTrigger>
            <FilterContainer
                className={cn(
                    "text-primary p-0 bg-neutral-700/90 backdrop-blur-sm border-neutral-600 shadow-lg",
                    isMobile ? "block w-10/12 md:w-full rounded-md max-w-lg" : "grid grid-cols-[12rem,_repeat(2,_minmax(0,_1fr))] grid-rows-1 md:grid-rows-none w-[45rem]",
                    className,
                )}
                align="end"
            >
                {/* Header/Tabs */}
                {isMobile ? (
                    <div className="p-2 border-b border-neutral-600">
                        <DialogTitle className="sr-only">Filters Modal</DialogTitle>
                        <DialogDescription className="sr-only">Filters Modal allowing filtering by amount, Categories and Accounts</DialogDescription>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="mr-auto flex group text-xl w-fit gap-1" size="icon">
                                    <span>Filters</span>
                                    <ChevronDown className="mt-0.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="p-1 border-b space-y-1 w-fit bg-neutral-700/90 border-neutral-600 backdrop-blur-sm"
                                align="start"
                            >
                                {FILTER_TABS.map((tab) => (
                                    <DropdownMenuItem
                                        key={tab}
                                        onClick={() => setActiveFilter(tab)}
                                        className={cn(
                                            "capitalize text-neutral-400 py-2 w-full rounded-sm hover:bg-background bg-inherit justify-start",
                                            activeFilter === tab && "bg-background text-white",
                                        )}
                                    >
                                        {tab}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ) : (
                    <>
                        <h2 className="row-start-1 col-start-1 p-3 text-xl border-r border-neutral-600">Filters</h2>
                        <div className="row-start-2 col-start-1 col-span-1 flex flex-col justify-start p-3 bg-transparent gap-1 h-auto border-r border-neutral-600 rounded-none">
                            {FILTER_TABS.map((tab) => (
                                <Button
                                    key={tab}
                                    onClick={() => setActiveFilter(tab)}
                                    className={cn(
                                        "capitalize text-neutral-400 py-2 w-full rounded-sm hover:bg-background bg-inherit justify-start",
                                        activeFilter === tab && "bg-background text-white",
                                    )}
                                    variant="ghost"
                                >
                                    {tab}
                                </Button>
                            ))}
                        </div>
                    </>
                )}

                {/* Filter Content */}
                <div className="md:grid md:grid-rows-subgrid col-start-1 md:col-start-2 row-start-2 md:row-start-1 row-span-2">
                    <h2 className="hidden md:inline-flex items-center text-sm ps-3 border-b border-neutral-600">Choose {activeFilter}:</h2>
                    <FilterContent
                        activeFilter={activeFilter}
                        accounts={data ?? []}
                        tempFilters={tempFilters}
                        setTempFilters={setTempFilters}
                    />
                </div>

                {/* Selected Filters */}
                {!isMobile && (
                    <div className="grid grid-rows-subgrid col-start-3 row-start-1 row-span-2 border-l border-neutral-600">
                        <h2 className="inline-flex items-center text-sm ps-3 border-b border-neutral-600">
                            {currentFilters.length} filters selected:
                        </h2>
                        <ScrollArea className="h-52 px-3">
                            <ul className="flex flex-col gap-3 text-sm">
                                {currentFilters.map((filter, index) => (
                                    <div key={`${filter.type}-${index}`} className="first:mt-3 last:mb-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-neutral-400">{filter.type}</p>
                                            <p className="text-white">{filter.value.toString().replace(/_/g, " ")}</p>
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
                )}

                {/* Footer */}
                <footer className="col-span-3 border-t border-neutral-600 p-2.5 flex justify-end gap-2">
                    {isMobile && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="mr-auto">
                                    {currentFilters.length} Filters Selected
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="text-sm p-0 text-primary bg-neutral-700/90 backdrop-blur-sm border-neutral-600 overflow-y-scroll max-h-52"
                                align="start"
                                collisionPadding={20}
                                portal={false}
                            >
                                {currentFilters.map((filter, index) => (
                                    <DropdownMenuItem key={`${filter.type}-${index}::CurrentFilters`} className="mx-auto text-sm w-full">
                                        <div className="flex justify-between items-center w-full">
                                            <div>
                                                <p className="w-fit text-sm text-neutral-400">{filter.type}</p>
                                                <p className="w-fit text-white">{filter.value.toString().replace(/_/g, " ")}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-neutral-400 float-right"
                                                onClick={() => handleRemoveFilter(filter)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <Button variant="accent" size="sm" onClick={handleResetAllFilters}>
                            Reset all
                    </Button>
                    <Button variant="accent" size="sm" onClick={handleApplyFilters}>
                            Apply Filters
                    </Button>
                </footer>
            </FilterContainer>
        </FilterWrapper>
    );
}