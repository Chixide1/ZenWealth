"use client"

import { useState, useEffect } from "react"
import { Column } from "@tanstack/react-table"
import { format, parse, isValid } from "date-fns"

import { Button } from "@/components/core/button"
import { Input } from "@/components/core/input"
import { Label } from "@/components/core/label"
import { Transaction } from "@/components/features/transactions/TransactionColumns"
import FilterButton from "@/components/shared/FilterButton.tsx";

interface DateTimeRange {
    from: { date: string; time: string }
    to: { date: string; time: string }
}

export default function DateTimeRangeFilterButton({
                                                      column,
                                                  }: {
    column: Column<Transaction, unknown>
}) {
    const [range, setRange] = useState<DateTimeRange>({
        from: { date: "", time: "" },
        to: { date: "", time: "" },
    })
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const fromDateTime = `${range.from.date}T${range.from.time}`
        const toDateTime = `${range.to.date}T${range.to.time}`
        const parsedFromDate = parse(fromDateTime, "yyyy-MM-dd'T'HH:mm", new Date())
        const parsedToDate = parse(toDateTime, "yyyy-MM-dd'T'HH:mm", new Date())

        if (isValid(parsedFromDate) && isValid(parsedToDate)) {
            column.setFilterValue({ from: parsedFromDate, to: parsedToDate })
        } else {
            column.setFilterValue(undefined)
        }
    }, [range, column])

    const handleInputChange = (
        type: "from" | "to",
        field: "date" | "time",
        value: string
    ) => {
        setRange((prev) => ({
            ...prev,
            [type]: { ...prev[type], [field]: value },
        }))
    }

    const handleClear = () => {
        setRange({
            from: { date: "", time: "" },
            to: { date: "", time: "" },
        })
        setIsOpen(false)
        column.setFilterValue(undefined)
    }

    const handleApply = () => {
        setIsOpen(false)
    }

    const formatRangeDisplay = () => {
        const { from, to } = range
        if (from.date && from.time && to.date && to.time) {
            const fromDate = parse(`${from.date}T${from.time}`, "yyyy-MM-dd'T'HH:mm", new Date())
            const toDate = parse(`${to.date}T${to.time}`, "yyyy-MM-dd'T'HH:mm", new Date())
            return `${format(fromDate, "PPpp")} - ${format(toDate, "PPpp")}`
        }
        return "Select date and time range"
    }

    return (
        <FilterButton column={column} className="max-w-60">
            <form
                className="grid gap-4"
                onSubmit={(e) => {
                    e.preventDefault()
                    console.log(e)
                }}
            >
                <h4 className="font-medium leading-none space-y-2">Filter by Date and Time</h4>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dateTimeCol-from">From</Label>
                        <Input
                            id="dateTimeCol-from"
                            className="w-auto [word-spacing:10px]"
                            type="datetime-local"
                            value={range.from.date}
                            onChange={(e) => handleInputChange("from", "date", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dateTimeCol-to">To</Label>
                        <Input
                            id="dateTimeCol-to"
                            className="w-auto [word-spacing:10px]"
                            type="datetime-local"
                            value={range.to.date}
                            onChange={(e) => handleInputChange("to", "date", e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                    <Button
                        variant="accent"
                        onClick={handleClear} 
                        type="submit"
                        className=""
                    >
                        Clear
                    </Button>
                    <Button
                        variant="accent"
                        onClick={handleApply}
                        type="submit"
                        className=""
                    >
                        Apply Filter
                    </Button>
                </div>
            </form>
        </FilterButton>
    )
}

