import { Label, Pie, PieChart } from "recharts"
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

const colorMap = new Map([
    ["depository", "hsl(var(--chart-1))"],
    ["credit", "hsl(var(--chart-2))"],
    ["loan", "hsl(var(--chart-3))"],
    ["investment", "hsl(var(--chart-4))"],
    ["other", "hsl(var(--chart-5))"],
])

export function TotalBalanceCard() {
    const [{data}] = useAtom(accountsAtom)
    const pieData = data?.map((account, index) => {
        const colors = Array.from(colorMap.values());
        const colorIndex = index % colors.length;

        return {...account, fill: colors[colorIndex]};
    })
    const total = data?.reduce((total, account) => total + account.balance, 0)
    // console.log(pieData);

    return (
        <Card className="flex flex-col col-span-7 bg-primary/10 border-neutral-700 text-primary">
            <CardHeader className="items-center pb-0">
                <CardTitle></CardTitle>
                <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px] w-full"
                >
                    <PieChart>
                        <ChartTooltip
                            // cursor={false}
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
                        <ChartLegend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
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
                                                    £{total}
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
