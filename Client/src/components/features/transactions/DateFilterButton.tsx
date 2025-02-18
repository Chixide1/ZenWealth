import { useState, useEffect } from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { transactionsParamsAtom } from "@/lib/atoms";

type DateFilterButtonProps = {
    className?: string
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

    const handleDateChange = (field: "beginDate" | "endDate", date: Date | undefined) => {
        setTempFilters((prev) => ({
            ...prev,
            [field]: date || null,
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

    const handleRemoveFilter = (field: "beginDate" | "endDate") => {
        setTempFilters((prev) => ({
            ...prev,
            [field]: null,
        }));
    };

    return (
        <DropdownMenu modal={true} open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button className="capitalize text-xs gap-1" variant="accent" size="sm">
                    Date Filter
                    <CalendarIcon className="h-4 w-4" strokeWidth={1.5} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn(" text-primary p-0 bg-neutral-700/90 backdrop-blur-sm border-0", className)}
                align="end"
            >
                <div className="">
                    {/* Left Column */}
                    <div className="p-4 border-r border-neutral-600">
                        <h3 className="text-sm mb-4">Start Date</h3>
                        <Calendar
                            mode="range"
                            selected={{from: tempFilters.beginDate ?? undefined, to: tempFilters.endDate ?? undefined}}
                            // onSelect={(date) => handleDateChange("beginDate", date)}
                            className="rounded-md border"
                        />
                    </div>

                    {/* Selected Filters */}
                    <div className="col-span-2 border-t border-neutral-600 p-4">
                        <h2 className="text-sm mb-2">Selected date range:</h2>
                        <ScrollArea className="h-20">
                            <ul className="flex flex-col gap-2 text-sm">
                                {tempFilters.beginDate && (
                                    <div className="flex justify-between items-center">
                                        <p>Start Date: {tempFilters.beginDate.toLocaleDateString()}</p>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-neutral-400"
                                            onClick={() => handleRemoveFilter("beginDate")}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                {tempFilters.endDate && (
                                    <div className="flex justify-between items-center">
                                        <p>End Date: {tempFilters.endDate.toLocaleDateString()}</p>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-neutral-400"
                                            onClick={() => handleRemoveFilter("endDate")}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </ul>
                        </ScrollArea>
                    </div>

                    {/* Footer */}
                    <div className="col-span-2 border-t border-neutral-600 p-4 flex justify-end gap-2">
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

