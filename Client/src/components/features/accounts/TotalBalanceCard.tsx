import { Label, Pie, PieChart } from "recharts"
import { useAtom } from 'jotai';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/core/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/core/chart"
import {accountsAtom} from "@/lib/atoms.ts";

const chartConfig = {
    name: {
        label: "Name",
    },
    balance: {
        label: "Balance",
    },
   type: {
        label: "Type",
    },
    // loan: {
    //     label: "Checking",
    //     color: "hsl(var(--chart-2))",
    // },
    // credit: {
    //     label: "Credit",
    //     color: "hsl(var(--chart-3))",
    // },
} satisfies ChartConfig

const colorMap = new Map([
    ["depository", "hsl(var(--chart-1))"],
    ["credit", "hsl(var(--chart-2))"],
    ["loan", "hsl(var(--chart-3))"],
    ["investment", "hsl(var(--chart-4))"],
    ["other", "hsl(var(--chart-5))"],
])

export function TotalBalanceCard() {
    const [{data}] = useAtom(accountsAtom)
    const pieData = data?.map((account) => {
        const fill = colorMap.get(account.type.toLowerCase())
        return {...account, fill: fill}
    })
    console.log(pieData);

    return (
        <Card className="flex flex-col col-span-8 bg-primary/10 border-neutral-700 text-primary">
            <CardHeader className="items-center pb-0">
                <CardTitle></CardTitle>
                <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    // formatter={(value) => `£${value.toLocaleString()}`}
                                    nameKey="balance"
                                    labelKey="balance"
                                    indicator="line"
                                    labelFormatter={(_, payload) => {
                                        return payload[0].payload.name
                                    }}
                                    className="text-black"
                                />
                            }
                            labelClassName="text-black"
                        />
                        <Pie
                            data={pieData}
                            nameKey="name"
                            dataKey="balance"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-primary text-3xl font-bold"
                                                >
                                                    £{data?.reduce((total, account) => total + account.balance, 0)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Total Balance
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
            </CardFooter>
        </Card>
    )
}
