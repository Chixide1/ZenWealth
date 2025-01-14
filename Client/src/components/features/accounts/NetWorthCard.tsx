import {Cell, Label, Pie, PieChart, ResponsiveContainer } from "recharts"
import { useAtom } from 'jotai';

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
    ChartContainer, ChartLegend,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {accountsAtom} from "@/lib/atoms.ts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import {currencyParser} from "@/lib/utils.ts";

const chartConfig = {
    id: {
      label: "ID",  
    },
    name: {
        label: "Name",
    },
    balance: {
        label: "Balance",
    },
   type: {
        label: "Type",
    },
    mask: {
        label: "Mask",
    },
    subtype: {
        label: "Subtype",
    },
    officialName: {
        label: "Official Name",
    }
} satisfies ChartConfig

const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
]

export function NetWorthCard() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [{data}] = useAtom(accountsAtom)
    const total = data?.reduce((total, account) => total + account.balance, 0) ?? 0
    const liablities = data?.reduce((liabilities, account) => {
        if(account.type === "Credit"){
            return liabilities + account.balance;
        }
        
        return liabilities + 0;
    }, 0) ?? 0
    const pieData = data?.map((account, index) => {
        const colorIndex = index % colors.length;
        return {...account, fill: colors[colorIndex]};
    })
    console.log(pieData);
    
    const InfoCard = ({amount, description}: {amount: number, description: string}) => (
        <div className="bg-primary/10 px-4 py-2 rounded-md text-center w-full border border-neutral-500">
            <p className="text-primary text-lg">{currencyParser.format(amount)}</p>
            <p className="text-xs text-neutral-400/90 font-semibold text-nowrap">{description}</p>
        </div>
    )

    return (
        <Card className="col-span-7 bg-primary/10 border-neutral-700 text-primary">
            <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-normal">Net Worth</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 pb-0">
                <CardDescription className="flex items-center justify-center flex-col gap-8">
                    <InfoCard amount={total - liablities} description={"Total Equity"} />
                    <InfoCard amount={total} description={"Total Balance"} />
                </CardDescription>
                <ResponsiveContainer height={250} className="w-full h-full">
                    <ChartContainer
                        config={chartConfig}
                        className=""
                    >
                        <PieChart>
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        // formatter={(value) => `£${value.toLocaleString()}`}
                                        nameKey="balance"
                                        labelKey="balance"
                                        indicator="line"
                                        labelFormatter={(_, payload) => {
                                            return payload[0].payload.name
                                        }}
                                        className=""
                                    />
                                }
                                labelClassName="text-black"
                            />
                            <Pie
                                data={pieData}
                                nameKey="name"
                                dataKey="balance"
                                innerRadius={0}
                                strokeWidth={5}
                            >
                                {pieData?.map((entry, index) => (
                                    <Cell
                                        key={`${entry.id}::TotalBalanceCard`}
                                        opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.5}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </ResponsiveContainer>
                <ScrollArea className="h-64 w-64">
                    <div className="flex flex-col gap-3 py-2 pr-4">
                        {pieData?.map((account, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: account.fill}} />
                                <div className="flex flex-col">
                                    <span className="text-sm text-zinc-400">{account.name}</span>
                                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-300">
                        {currencyParser.format(account.balance)}
                      </span>
                                        <span className="text-xs text-zinc-500">
                        {((account.balance / total) * 100).toFixed(2)}%
                      </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="py-8">
            </CardFooter>
        </Card>
    )
}
