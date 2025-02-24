"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn, formatDate } from "@/lib/utils";
import { useAtom } from "jotai";
import { transactionsParamsAtom } from "@/lib/atoms";
import type { DateRange } from "react-day-picker";
import { useIsMobile } from "@/hooks/use-mobile.tsx";

type DateFilterButtonProps = {
    className?: string
}

type DateSpan = {
    from: Date
    to: Date
}

type DateButtonConfig = {
    name: string
    value: DateSpan
}

export function DateFilterButton({ className }: DateFilterButtonProps) {
    const [filters, setFilters] = useAtom(transactionsParamsAtom);
    const [isOpen, setIsOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);
    const isMobile = useIsMobile();

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
            name: "This Week",
            value: (() => {
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                return { from: startOfWeek, to: today };
            })(),
        },
        {
            name: "Last Week",
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
            name: "This Month",
            value: (() => {
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                return { from: startOfMonth, to: today };
            })(),
        },
        {
            name: "Last Month",
            value: (() => {
                const today = new Date();
                const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                return { from: startOfLastMonth, to: endOfLastMonth };
            })(),
        },
        {
            name: "This Year",
            value: (() => {
                const today = new Date();
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                return { from: startOfYear, to: today };
            })(),
        },
        {
            name: "Last Year",
            value: (() => {
                const today = new Date();
                const startOfYear = new Date(today.getFullYear() - 1, 0, 1);
                const endOfYear = new Date(today.getFullYear() - 1, 12, 1);
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
    
    const mobileSelectedPeriod = () => {
        const result = dateButtons.find((b) => {
            return formatDate(b.value.from) === formatDate(tempFilters.beginDate) && formatDate(b.value.to) === formatDate(tempFilters.endDate);
        });
        
        if (!result) {
            return "Custom Period";
        }
        
        return result.name;
    };

    const FilterContent = (
        <div className="md:grid-cols-2  md:auto-cols-auto md:grid flex flex-col w-fit">
            <div className="hidden md:flex min-w-36 flex-col items-center gap-2 p-3 pb-4">
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
                                endDate: button.value.to,
                            });
                        }}
                        aria-selected={
                            formatDate(button.value.from) === formatDate(tempFilters.beginDate) &&
                            formatDate(button.value.to) === formatDate(tempFilters.endDate)
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
                            {mobileSelectedPeriod()}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="text-sm p-2 text-primary bg-neutral-700/90 backdrop-blur-sm border-neutral-600 overflow-y-scroll"
                        align="start"
                        collisionPadding={20}
                        portal={false}
                    >
                        {dateButtons.map((button) => (
                            <DropdownMenuItem
                                key={button.name + "::DateFilterButtonMobile"}
                                className="w-full text-sm peer text-neutral-400 hover:bg-background aria-selected:bg-background"
                                onClick={() => {
                                    setTempFilters({
                                        ...filters,
                                        beginDate: button.value.from,
                                        endDate: button.value.to,
                                    });
                                }}
                                aria-selected={
                                    formatDate(button.value.from) === formatDate(tempFilters.beginDate) &&
                                    formatDate(button.value.to) === formatDate(tempFilters.endDate)
                                }
                            >
                                {button.name}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                            className="w-full text-sm text-neutral-400 disabled:opacity-100 bg-background peer-aria-[selected=true]:bg-transparent"
                        >
                            Custom Period
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <div className="mx-auto md:border-l border-neutral-600">
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
            <div className="col-span-2 flex justify-end gap-2 border-t border-neutral-600 p-2.5 text-sm">
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
    );

    if (isMobile) {
        return (
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
                    {FilterContent}
                </DialogContent>
            </Dialog>
        );
    }

    return (
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
                {FilterContent}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

