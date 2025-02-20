﻿import { useState, useEffect } from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTimePicker} from "@/components/ui/date-time-picker.tsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {cn, formatDate} from "@/lib/utils";
import { useAtom } from "jotai";
import { transactionsParamsAtom } from "@/lib/atoms";
import type { DateRange } from "react-day-picker";

type DateFilterButtonProps = {
    className?: string
}

type DateSpan = {
    from: Date,
    to: Date,
}

type DateButtonConfig = {
    name: string;
    value: DateSpan;
};

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
            value: (() => {
                const today = new Date();
                return { from: today, to: today };
            })(),
        },
        {
            name: "This week",
            value: (() => {
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                return { from: startOfWeek, to: today };
            })(),
        },
        {
            name: "Last week",
            value: (() => {
                const today = new Date();
                const startOfLastWeek = new Date(today);
                startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
                const endOfLastWeek = new Date(startOfLastWeek);
                endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
                return { from: startOfLastWeek, to: endOfLastWeek };
            })(),
        },
        {
            name: "This month",
            value: (() => {
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                return { from: startOfMonth, to: today };
            })(),
        },
        {
            name: "Last month",
            value: (() => {
                const today = new Date();
                const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                return { from: startOfLastMonth, to: endOfLastMonth };
            })(),
        },
        {
            name: "This year",
            value: (() => {
                const today = new Date();
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                return { from: startOfYear, to: today };
            })(),
        },
        {
            name: "Last year",
            value: (() => {
                const today = new Date();
                const startOfYear = new Date(today.getFullYear() - 2, 0, 1);
                const endOfYear = new Date(today.getFullYear() - 1, 0, 1);
                return { from: startOfYear, to: endOfYear };
            })(),
        },
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
                <Button className="gap-1 text-xs capitalize" variant="accent" size="sm">
                    Date
                    <CalendarIcon className="h-4 w-4" strokeWidth={1.5} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn("w-auto text-primary p-0 bg-neutral-700/90 backdrop-blur-sm border-neutral-600", className)}
                align="end"
            >
                <div className="grid-cols-[auto,_minmax(0,_1fr))] grid">
                    <div className="flex min-w-36 flex-col items-center gap-1.5 p-3 pb-4">
                        {dateButtons.map((button) => (
                            <Button
                                key={button.name + "::DateFilterButton"}
                                variant="ghost"
                                size="sm"
                                className="w-full text-sm peer text-neutral-400 hover:bg-background aria-selected:bg-background"
                                onClick={() => {
                                    setTempFilters({
                                        ...filters,
                                        beginDate: button.value.from,
                                        endDate: button.value.to
                                    });
                                }}
                                aria-selected={
                                    formatDate(button.value.from) === formatDate(tempFilters.beginDate) &&
                                    formatDate(button.value.to) === formatDate(tempFilters.endDate)
                                }
                            >{button.name}</Button>
                        ))}
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={true}
                            className="w-full text-sm text-neutral-400 disabled:opacity-100 bg-background peer-aria-[selected=true]:bg-transparent"
                        >{"Custom Period"}</Button>
                    </div>
                    <div className="border-l border-neutral-600">
                        <DateTimePicker
                            yearRange={10}
                            mode="range"
                            selected={{
                                from: tempFilters.beginDate ?? undefined,
                                to: tempFilters.endDate ?? undefined,
                            }}
                            onSelect={handleDateChange}
                        />
                    </div>

                    {/* Footer */}
                    <div className="col-span-2 flex justify-end gap-2 border-t border-neutral-600 p-4 text-sm">
                        {tempFilters.beginDate && tempFilters.endDate && (
                            <div className="bg-accent mr-auto flex items-center justify-between rounded-full px-3 text-black">
                                <p>
                                    {tempFilters.beginDate.toLocaleDateString()} - {tempFilters.endDate.toLocaleDateString()}
                                </p>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-600" onClick={handleRemoveFilter}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <Button variant="accent" size="sm" onClick={handleApplyFilters}>
                            Apply
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
