import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3 text-neutral-400", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-primary",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-primary border-0"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full space-y-1",
                head_row: "flex",
                head_cell: "text-primary w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-start)]:rounded-l-md [&:has([aria-selected].day-range-end)]:rounded-r-md",
                    props.mode === "range"
                        ? ""
                        : ""
                ),
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-black"
                ),
                day_range_start: "day-range-start aria-selected:rounded-r-none",
                day_range_end: "day-range-end aria-selected:rounded-l-none",
                day_selected: "bg-accent text-black focus:bg-accent",
                day_today: "text-secondary aria-selected:text-black",
                day_outside: "day-outside aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground aria-selected:rounded-none",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                // @ts-expect-error Components for month arrows
                IconLeft: ({ className, ...props }: { [p: string]: never}) => (
                    <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
                ),
                IconRight: ({ className, ...props }: { [p: string]: never }) => (
                    <ChevronRight className={cn("h-4 w-4", className)} {...props} />
                ),
            }}
            {...props}
        />
    );
}
Calendar.displayName = "Calendar";

export { Calendar };
