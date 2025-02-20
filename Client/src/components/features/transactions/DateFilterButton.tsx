import { useState, useEffect } from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { transactionsParamsAtom } from "@/lib/atoms";
import type { DateRange } from "react-day-picker";

type DateFilterButtonProps = {
    className?: string
}

type DateButtonConfig = {
    name: string,
    onClick: () => void,
}

export function DateFilterButton({ className }: DateFilterButtonProps) {
    const [filters, setFilters] = useAtom(transactionsParamsAtom);
    const [isOpen, setIsOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);

    useEffect(() => {
        if (isOpen) {
            setTempFilters(filters);
        }
    }, [isOpen, filters]);

    const dateButtons: DateButtonConfig[] = [
        {
            name: "Today",
            onClick: () => {
                setTempFilters({
                    ...tempFilters,
                    beginDate: new Date(),
                    endDate: new Date(),
                });
            }
        },
        {
            name: "This week",
            onClick: () => {
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                setTempFilters({
                    ...tempFilters,
                    beginDate: startOfWeek,
                    endDate: today,
                });
            }
        },
        {
            name: "Last week",
            onClick: () => {
                const today = new Date();
                const lastWeek = new Date(today);
                lastWeek.setDate(today.getDate() - 7);
                setTempFilters({
                    ...tempFilters,
                    beginDate: lastWeek,
                    endDate: today,
                });
            }
        },
        {
            name: "This month",
            onClick: () => {
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                setTempFilters({
                    ...tempFilters,
                    beginDate: startOfMonth,
                    endDate: today,
                });
            }
        },
        {
            name: "Last month",
            onClick: () => {
                const today = new Date();
                const lastMonth = new Date(today);
                lastMonth.setMonth(today.getMonth() - 1);
                setTempFilters({
                    ...tempFilters,
                    beginDate: lastMonth,
                    endDate: today,
                });
            }
        },
        {
            name: "This year",
            onClick: () => {
                const today = new Date();
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                setTempFilters({
                    ...tempFilters,
                    beginDate: startOfYear,
                    endDate: today,
                });
            }
        },
        {
            name: "Custom period",
            onClick: () => {
                // Custom period just opens the calendar for manual selection
                setTempFilters({
                    ...tempFilters,
                    beginDate: null,
                    endDate: null,
                });
            }
        }
    ];

    const handleDateChange = (range: DateRange | undefined) => {
        setTempFilters((prev) => ({
            ...prev,
            beginDate: range?.from || null,
            endDate: range?.to || null,
        }));
    };

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setIsOpen(false);
    };

    const handleResetAllFilters = () => {
        setTempFilters({
            ...tempFilters,
            beginDate: null,
            endDate: null,
        });
    };

    const handleRemoveFilter = () => {
        setTempFilters((prev) => ({
            ...prev,
            beginDate: null,
            endDate: null,
        }));
    };

    return (
        <DropdownMenu modal={true} open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button className="capitalize text-xs gap-1" variant="accent" size="sm">
                    Date
                    <CalendarIcon className="h-4 w-4" strokeWidth={1.5} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn("w-auto text-primary p-0 bg-neutral-700/90 backdrop-blur-sm border-neutral-600", className)}
                align="end"
            >
                <div className="grid grid-cols-[auto,_minmax(0,_1fr))]">
                    <div className="p-3 min-w-36 flex flex-col gap-1.5 items-center">
                        {dateButtons.map((button) => (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm text-neutral-400 hover:bg-background w-full"
                                onClick={button.onClick}
                            >{button.name}</Button>
                        ))}
                    </div>
                    <div className="border-l border-neutral-600">
                        <Calendar
                            mode="range"
                            selected={{
                                from: tempFilters.beginDate ?? undefined,
                                to: tempFilters.endDate ?? undefined,
                            }}
                            onSelect={handleDateChange}
                            className=""
                        />
                    </div>

                    {/* Footer */}
                    <div className="col-span-2 border-t border-neutral-600 p-4 flex justify-end gap-2 text-sm">
                        {tempFilters.beginDate && tempFilters.endDate && (
                            <div className="flex justify-between items-center mr-auto text-black bg-accent px-3 rounded-full">
                                <p>
                                    {tempFilters.beginDate.toLocaleDateString()} - {tempFilters.endDate.toLocaleDateString()}
                                </p>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-600" onClick={handleRemoveFilter}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <Button variant="accent" size="sm" onClick={handleResetAllFilters}>
                            Reset
                        </Button>
                        <Button variant="accent" size="sm" onClick={handleApplyFilters}>
                            Apply
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
