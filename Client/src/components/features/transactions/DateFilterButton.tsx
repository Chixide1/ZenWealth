"use client"

import { useState } from "react"
import { Column } from "@tanstack/react-table"
import { isValid } from "date-fns"

import { Button } from "@/components/core/button"
import { Input } from "@/components/core/input"
import { Label } from "@/components/core/label"
import { Transaction } from "@/types"
import FilterButton from "@/components/shared/FilterButton.tsx"

export default function DateTimeRangeFilterButton({column}: { column: Column<Transaction, unknown> }) {
    const [fromDate, setFromDate] = useState("")
    const [fromTime, setFromTime] = useState("00:00")
    const [toDate, setToDate] = useState("")
    const [toTime, setToTime] = useState("00:00")

    const handleClear = () => {
        setFromDate("")
        setFromTime("00:00")
        setToDate("")
        setToTime("00:00")
        column.setFilterValue(undefined)
    }

    return (
        <FilterButton column={column} className="w-auto">
            <form
                className="grid gap-4"
                onSubmit={(e) => {
                    e.preventDefault()
                    const from = new Date(fromDate + "T" + fromTime)
                    const to = new Date(toDate + "T" + toTime)
                    
                    if (isValid(from) && isValid(to)) {
                        column.setFilterValue({from: from, to: to})
                    }
                }}
            >
                <div className="flex items-center justify-between">
                    <h4 className="font-medium leading-none space-y-2">Filter by Date & Time</h4>
                    <Button
                        className="text-secondary"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                    >
                        Reset
                    </Button>
                </div>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label>From</Label>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-auto"
                                max={new Date().toISOString().split("T")[0]}
                            />
                            <Input
                                type="time"
                                value={fromTime}
                                onChange={(e) => setFromTime(e.target.value)}
                                className="w-auto"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>To</Label>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-auto"
                                max={new Date().toISOString().split("T")[0]}
                            />
                            <Input
                                type="time"
                                value={toTime}
                                onChange={(e) => setToTime(e.target.value)}
                                className="w-auto"
                            />
                        </div>
                    </div>
                </div>
                <Button variant="accent" className="w-full" type="submit">Apply Filter</Button>
            </form>
        </FilterButton>
    )
}