import { Line, LineChart, ResponsiveContainer, type TooltipProps, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/ui/chart"
import { cn, currencyParser } from "@/lib/utils"
import { ArrowLink } from "@/components/shared/ArrowLink.tsx"
import { Separator } from "@/components/ui/separator.tsx"
import { useIsMobile } from "@/hooks/use-mobile.tsx"
import type { MonthlySummary } from "@/types"

type IncomeOutcomeLineGraphProps = {
    className?: string
    data: MonthlySummary[]
}

export function IncomeOutcomeLineGraph({ className, data }: IncomeOutcomeLineGraphProps) {
    const yearlyExpenditure = data.reduce((acc, value) => acc + value.expenditure, 0)
    const isMobile = useIsMobile()

    return (
        <Card className={cn("bg-[hsl(0,0%,10%)] border border-neutral-800", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Income vs Expenses</CardTitle>
                    <ArrowLink to="/analytics" />
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-0">
                <ResponsiveContainer height={200} width="100%" className="text-xs md:text-sm">
                    <LineChart
                        data={data}
                        margin={{
                            right: isMobile ? 10 : 20,
                            bottom: 5,
                            left: isMobile ? 10 : 20,
                            top: 5
                        }}
                    >
                        <XAxis
                            dataKey="month"
                            interval={0}
                        />
                        <ChartTooltip
                            content={({ active, payload }: TooltipProps<number, string>) => {
                                if (active && payload && payload.length > 0) {
                                    return (
                                        <div className="bg-transparent space-y-2">
                                            <p className="w-fit bg-neutral-700/10 border backdrop-blur-sm border-neutral-700 rounded-full px-2 py-1 inline-flex items-center gap-1">
                                                <span className="h-1 w-1 rounded-full bg-secondary" />
                                                {payload[0] && typeof payload[0].value === "number"
                                                    ? currencyParser.format(payload[0].value)
                                                    : "N/A"}
                                            </p>
                                            <p className="bg-tertiary rounded-full px-2 w-fit py-1">
                                                {payload[1] && typeof payload[1].value === "number"
                                                    ? currencyParser.format(payload[1].value)
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                            cursor={{
                                opacity: 0.1,
                                // stroke: "red"
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expenditure"
                            stroke="hsl(var(--secondary))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={{stroke: "none"}}
                        />
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke="hsl(var(--tertiary-1))"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{stroke: "none"}}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
            <CardFooter className="bg-[#232323] mx-3 mb-3 rounded-2xl p-2 block">
                <div className="inline-flex gap-4 justify-between items-center w-full border-b border-neutral-700 p-2">
                    <div className="inline-flex flex-col md:flex-row md:gap-2 items-center">
                        <span className="text-primary">{currencyParser.format(yearlyExpenditure / data.length)}</span>
                        <span className="text-sm text-center text-neutral-400">Average Monthly Expenditure</span>
                    </div>
                    <Separator orientation="vertical" className="h-10 md:h-5 bg-neutral-700" />
                    <div className="inline-flex flex-col md:flex-row items-center me-10 md:me-0 md:gap-6 text-neutral-500 text-sm">
                        <div className="inline-flex gap-1 items-center me-auto text-neutral-400">
                            <div className="w-2 h-2 rounded-full bg-secondary" />
                            <span>Income</span>
                        </div>
                        <div className="inline-flex gap-1 items-center me-auto text-neutral-400">
                            <div className="w-2 h-2 rounded-full bg-tertiary" />
                            <span>Expenses</span>
                        </div>
                    </div>
                </div>
                <CardDescription className="rounded-md w-full p-2 text-neutral-400">
                    This chart depicts the monthly financial performance, highlighting income earned and expenses incurred
                    throughout the year, allowing for a better understanding of overall financial health
                </CardDescription>
            </CardFooter>
        </Card>
    )
}

