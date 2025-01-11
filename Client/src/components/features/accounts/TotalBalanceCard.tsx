"use client"

import { TrendingUp } from "lucide-react"
import { RadialBar, RadialBarChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
    { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
    { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
    { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
    { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
    { browser: "other", visitors: 90, fill: "var(--color-other)" },
]

const total = chartData.reduce((a, b) => {
    return a + b.visitors
}, 0)

const data = chartData.map((item) => {
    return {...item, percentage: (item.visitors / total) * 100}
})

console.log(total)

const chartConfig = {
    visitors: {
        label: "Visitors",
    },
    chrome: {
        label: "Chrome",
        color: "hsl(var(--chart-1))",
    },
    safari: {
        label: "Safari",
        color: "hsl(var(--chart-2))",
    },
    firefox: {
        label: "Firefox",
        color: "hsl(var(--chart-3))",
    },
    edge: {
        label: "Edge",
        color: "hsl(var(--chart-4))",
    },
    other: {
        label: "Other",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig

export function TotalBalanceCard() {
    return (
        <Card className="flex flex-col col-span-8 text-foreground">
            <CardHeader className="pb-0">
                <CardTitle className="text-xl font-normal">Total Balance</CardTitle>
                {/*<CardDescription>January - June 2024</CardDescription>*/}
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadialBarChart
                        data={data}
                        // dataKey="visitors"
                        innerRadius={40}
                        outerRadius={110}
                        barSize={7}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                hideLabel={true}
                                nameKey="browser" 
                            />}
                        />
                        <RadialBar
                            dataKey="percentage"
                            background={true}
                            cornerRadius={10}
                            
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
