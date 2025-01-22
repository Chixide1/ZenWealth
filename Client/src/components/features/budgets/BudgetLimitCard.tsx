"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLink } from "@/components/shared/ArrowLink"
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import {cn} from "@/lib/utils.ts";

const chartConfig = {
    progress: {
        label: "Progress",
        color: "hsl(216, 100%, 60%)",
    },
    background: {
        label: "Background",
        color: "hsl(216, 70%, 40%)",
    },
} satisfies ChartConfig

const spent = 5200
const total = 7000
const percentage = Math.round((spent / total) * 100)

const chartData = [
    {
        name: "Progress",
        progress: percentage,
        background: 100,
    },
]

export function BudgetLimitCard() {
    return (
        <Card className="col-span-full md:col-span-7 bg-primary/[0.125] backdrop-blur-sm border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Monthly Budget spending</CardTitle>
                <ArrowLink to="/" />
            </CardHeader>
            <CardContent className="flex space-y-4 overflow-hidden max-h-44">
                <ResponsiveContainer height={300} className="relative w-auto">
                    <ChartContainer config={chartConfig}>
                        <RadialBarChart
                            innerRadius="60%"
                            outerRadius="90%"
                            data={chartData}
                            startAngle={180}
                            endAngle={0}
                            cy={"45%"}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 100]}
                                angleAxisId={0}
                                tick={false}
                            />
                            <RadialBar
                                dataKey="progress"
                                cornerRadius={30}
                                fill={chartConfig.progress.color}
                                background={{fill: "hsl(216, 70%, 40%)"}}
                            />
                        </RadialBarChart>
                    </ChartContainer>
                </ResponsiveContainer>
                <CardDescription className="w-5/12 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-blue-400">{percentage}%</div>
                    <div className="text-lg text-neutral-400 mt-2">
                        You have spent ${spent.toLocaleString()} of ${total.toLocaleString()}
                    </div>
                </CardDescription>
            </CardContent>
        </Card>
    )
}
