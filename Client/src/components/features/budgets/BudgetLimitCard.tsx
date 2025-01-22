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

function Needle({ rotation, className }: { rotation: number, className?: string }) {
    // Convert percentage to degrees (180 degrees = 100%)
    const degrees = 180 - (rotation / 100) * 180

    return (
        <div
            className={cn("absolute inset-x-0 bottom-0 right-0 w-[3px] h-[60px]", className)}
            style={{
                transform: `translateX(-50%) rotate(${degrees}deg)`,
            }}
        >
            <div className="w-full h-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-full shadow-lg" />
            <div className="absolute -bottom-[6px] left-1/2 w-3 h-3 bg-blue-400 rounded-full transform -translate-x-1/2 shadow-lg" />
        </div>
    )
}

export function BudgetLimitCard() {
    return (
        <Card className="col-span-full md:col-span-7 bg-primary/[0.125] backdrop-blur-sm border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Budget spending</CardTitle>
                <ArrowLink to="/" />
            </CardHeader>
            <CardContent className="flex  space-y-4">
                <ResponsiveContainer height={300} width={300} className="relative">
                    <ChartContainer config={chartConfig}>
                        <RadialBarChart
                            innerRadius="65%"
                            outerRadius="85%"
                            data={chartData}
                            startAngle={180}
                            endAngle={0}
                            cy="65%"
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
                                className="relative"
                            />
                        </RadialBarChart>
                    </ChartContainer>
                </ResponsiveContainer>
                <Needle rotation={percentage} className=""/>
                <CardDescription className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-blue-400">{percentage}%</div>
                    <div className="text-xs text-neutral-400 mt-2">
                        You have spent ${spent.toLocaleString()} of ${total.toLocaleString()}
                    </div>
                </CardDescription>
            </CardContent>
        </Card>
    )
}
