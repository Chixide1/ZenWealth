import { useState, useEffect } from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {cn, formatDate} from "@/lib/utils";
import { useAtom } from "jotai";
import { transactionsParamsAtom } from "@/lib/atoms";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DateRange } from "react-day-picker";

type DateSpan = {
    from: Date
    to: Date
}

type DateFilterProps = {
    className?: string
}

// =========================
// Date utility functions
// =========================

const getDateRanges = {
    today: (): DateSpan => {
        const today = new Date();
        return { from: today, to: today };
    },
    thisWeek: (): DateSpan => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return { from: startOfWeek, to: today };
    },
    lastWeek: (): DateSpan => {
        const today = new Date();
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        return { from: startOfLastWeek, to: endOfLastWeek };
    },
    thisMonth: (): DateSpan => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from: startOfMonth, to: today };
    },
    lastMonth: (): DateSpan => {
        const today = new Date();
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return { from: startOfLastMonth, to: endOfLastMonth };
    },
    thisYear: (): DateSpan => {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return { from: startOfYear, to: today };
    },
    lastYear: (): DateSpan => {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear() - 1, 0, 1);
        const endOfYear = new Date(today.getFullYear() - 1, 12, 1);
        return { from: startOfYear, to: endOfYear };
    },
};

// =========================
// Constants
// =========================

const DATE_BUTTONS = [
    { name: "Today", getValue: getDateRanges.today },
    { name: "This Week", getValue: getDateRanges.thisWeek },
    { name: "Last Week", getValue: getDateRanges.lastWeek },
    { name: "This Month", getValue: getDateRanges.thisMonth },
    { name: "Last Month", getValue: getDateRanges.lastMonth },
    { name: "This Year", getValue: getDateRanges.thisYear },
    { name: "Last Year", getValue: getDateRanges.lastYear },
];

// =========================
// Internal component for the filter content
// =========================

function DateFilterContent({
    selected,
    onSelect,
    onApply,
}: {
    selected: DateRange | undefined
    onSelect: (range: DateRange | undefined) => void
    onApply: () => void
}) {
    const handleRemoveFilter = () => onSelect(undefined);

    const selectedPeriod = () => {
        if (!selected?.from || !selected?.to) return "Custom Period";

        const result = DATE_BUTTONS.find((b) => {
            const value = b.getValue();
            return formatDate(value.from) === formatDate(selected.from ?? null) && formatDate(value.to) === formatDate(selected.to ?? null);
        });

        return result?.name ?? "Custom Period";
    };

    return (
        <div className="md:auto-cols-auto md:grid flex flex-col w-fit">
            <div className="hidden md:flex min-w-36 flex-col items-center gap-2 p-3 pb-4">
                {DATE_BUTTONS.map((button) => (
                    <Button
                        key={`${button.name}::DateFilterButton`}
                        variant="ghost"
                        size="sm"
                        className="w-full text-sm peer text-neutral-400 hover:bg-background aria-selected:bg-background"
                        onClick={() => {
                            const value = button.getValue();
                            onSelect({ from: value.from, to: value.to });
                        }}
                        aria-selected={
                            selected?.from &&
                            selected?.to &&
                            formatDate(button.getValue().from) === formatDate(selected.from) &&
                            formatDate(button.getValue().to) === formatDate(selected.to)
                        }
                    >
                        {button.name}
                    </Button>
                ))}
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={true}
                    className="w-full text-sm text-neutral-400 disabled:opacity-100 bg-background peer-aria-[selected=true]:bg-transparent"
                >
                    Custom Period
                </Button>
            </div>

            <header className="p-3 md:hidden border-b border-neutral-600">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="mr-auto">
                            {selectedPeriod()}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="text-sm p-2 text-primary bg-neutral-700/90 backdrop-blur-sm border-neutral-600 overflow-y-scroll"
                        align="start"
                        collisionPadding={20}
                        portal={false}
                    >
                        {DATE_BUTTONS.map((button) => (
                            <DropdownMenuItem
                                key={`${button.name}::DateFilterButtonMobile`}
                                className="w-full text-sm peer text-neutral-400 hover:bg-background aria-selected:bg-background"
                                onClick={() => {
                                    const value = button.getValue();
                                    onSelect({ from: value.from, to: value.to });
                                }}
                                aria-selected={
                                    selected?.from &&
                                    selected?.to &&
                                    formatDate(button.getValue().from) === formatDate(selected.from) &&
                                    formatDate(button.getValue().to) === formatDate(selected.to)
                                }
                            >
                                {button.name}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem className="w-full text-sm text-neutral-400 disabled:opacity-100 bg-background peer-aria-[selected=true]:bg-transparent">
                            Custom Period
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <div className="mx-auto md:border-l border-neutral-600">
                <DateTimePicker yearRange={10} mode="range" selected={selected} onSelect={onSelect} />
            </div>

            <div className="col-span-2 flex justify-end gap-2 border-t border-neutral-600 p-2.5 text-sm">
                {selected?.from && selected?.to && (
                    <div className="bg-accent mr-auto flex items-center justify-between rounded-full px-3 text-black">
                        <p>
                            {selected.from.toLocaleDateString()} - {selected.to.toLocaleDateString()}
                        </p>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-600" onClick={handleRemoveFilter}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <Button variant="accent" size="sm" onClick={onApply}>
                    Apply
                </Button>
            </div>
        </div>
    );
}

// =========================
// Main component
// =========================

export function DateFilterButton({ className }: DateFilterProps) {
    const [filters, setFilters] = useAtom(transactionsParamsAtom);
    const [isOpen, setIsOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState<DateRange | undefined>(
        filters.beginDate && filters.endDate ? { from: filters.beginDate, to: filters.endDate } : undefined,
    );
    const isMobile = useIsMobile();

    useEffect(() => {
        if (isOpen) {
            setTempFilters(
                filters.beginDate && filters.endDate ? { from: filters.beginDate, to: filters.endDate } : undefined,
            );
        }
    }, [isOpen, filters]);

    const handleDateChange = (range: DateRange | undefined) => {
        setTempFilters(range);
    };

    const handleApplyFilters = () => {
        setFilters((prev) => ({
            ...prev,
            beginDate: tempFilters?.from ?? null,
            endDate: tempFilters?.to ?? null,
        }));
        setIsOpen(false);
    };

    const filterContent = (
        <DateFilterContent selected={tempFilters} onSelect={handleDateChange} onApply={handleApplyFilters} />
    );
    
    return ( isMobile ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-1 text-xs capitalize px-2 md:px-3" variant="accent" size="sm">
                    <span className="hidden md:inline">Date</span>
                    <CalendarIcon className="h-4 w-4" strokeWidth={1.5} />
                </Button>
            </DialogTrigger>
            <DialogContent
                className={cn(
                    "rounded w-fit md:w-full max-w-lg text-primary p-0 bg-neutral-700/90 backdrop-blur-sm border-neutral-600",
                    className,
                )}
            >
                <DialogTitle className="sr-only">Date Modal</DialogTitle>
                <DialogDescription className="sr-only">Date Modal allowing filtering by Date</DialogDescription>
                {filterContent}
            </DialogContent>
        </Dialog>
    ) : (
        <DropdownMenu modal={true} open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button className="gap-1 text-xs capitalize p-3" variant="accent" size="sm">
                    <span className="hidden md:inline">Date</span>
                    <CalendarIcon className="h-4 w-4" strokeWidth={1.5} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn("w-auto text-primary p-0 bg-neutral-700/90 backdrop-blur-sm border-neutral-600", className)}
                align="end"
            >
                {filterContent}
            </DropdownMenuContent>
        </DropdownMenu>
    ));
}

