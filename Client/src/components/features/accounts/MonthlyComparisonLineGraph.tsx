import { Line, LineChart, TooltipProps, XAxis } from "recharts"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import {cn, currencyParser} from "@/lib/utils"
import {ArrowLink} from "@/components/shared/ArrowLink.tsx";
import {Separator} from "@/components/ui/separator.tsx";

type MonthlySummaryData = {
    month: string,
    income: number,
    expenses: number,
}

type IncomeOutcomeLineGraphProps = {
    className?: string,
    data: MonthlySummaryData[]
}

export function MonthlyComparisonLineGraph({className, data}: IncomeOutcomeLineGraphProps) {
    const yearlyExpenditure = data.reduce((acc, value) => acc + value.expenses, 0)

    return (
        <Card className={cn("bg-[hsl(0,0%,10%)] border-neutral-800", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Income vs Expenses</CardTitle>
                    <ArrowLink to="/analytics" />
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-0">
                <ChartContainer
                    config={{
                        income: {
                            label: "Income",
                            color: "hsl(var(--secondary))",
                        },
                        expenses: {
                            label: "Expenses",
                            color: "hsl(var(--tertiary-1))",
                        },
                    }}
                    className="h-[200px] w-full"
                >
                    <LineChart
                        data={data}
                        margin={{
                            right: 20,
                            bottom: 5,
                            left: 20,
                        }}
                    >
                        <XAxis dataKey="month"/>
                        <ChartTooltip
                            content={({active, payload}: TooltipProps<number, string>) => {
                                if(active) {
                                    return (
                                        <div className="bg-transparent space-y-2">
                                            <p className="w-fit bg-neutral-700/10 border backdrop-blur-sm border-neutral-700 rounded-full px-2 py-1 inline-flex items-center gap-1">
                                                <div className="h-1 w-1 rounded-full bg-secondary" />
                                                {currencyParser.format(payload?.[0].value ?? 0)}
                                            </p>
                                            <p className="bg-tertiary rounded-full px-2 w-fit py-1">{currencyParser.format(payload?.[1].value ?? 0)}</p>
                                        </div>
                                    )
                                }
                                return null;
                            }}
                            cursor={{
                                opacity: 0.1
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="hsl(var(--secondary))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke="hsl(var(--tertiary-1))"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="bg-[#232323] mx-3 mb-3 rounded-2xl p-2 block">
                <div className="inline-flex gap-4 justify-between items-center w-full border-b border-neutral-700 p-2">
                    <div className="inline-flex flex-col md:flex-row md:gap-2 items-center">
                        <span>{currencyParser.format(yearlyExpenditure)}</span>
                        <span className="text-neutral-500 text-sm">Yearly expenditure</span>
                    </div>
                    <Separator orientation="vertical" className="h-10 md:h-5 bg-neutral-700" />
                    <div className="inline-flex flex-col md:flex-row items-center md:gap-6 text-neutral-500 text-sm">
                        <div className="inline-flex gap-1 items-center me-auto">
                            <div className="w-2 h-2 rounded-full bg-secondary" />
                            <span>Income</span>
                        </div>
                        <div className="inline-flex gap-1 items-center me-auto">
                            <div className="w-2 h-2 rounded-full bg-tertiary" />
                            <span>Expenses</span>
                        </div>
                    </div>
                </div>
                <CardDescription className="rounded-md w-full p-2">
                    This chart depicts the monthly financial performance, highlighting income earned and expenses incurred throughout the year, allowing for a better understanding of overall financial health
                </CardDescription>
            </CardFooter>
        </Card>
    )
}

