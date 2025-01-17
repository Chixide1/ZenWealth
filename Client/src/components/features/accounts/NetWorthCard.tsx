import {Cell, Pie, PieChart, ResponsiveContainer} from "recharts"
import {useAtom} from 'jotai';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart"
import {accountsAtom} from "@/lib/atoms.ts";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useState} from "react";
import {currencyParser} from "@/lib/utils.ts";
import { Link } from "@tanstack/react-router";
import { MoveUpRight } from 'lucide-react';
import { TooltipProps } from 'recharts';
import {Account} from "@/types.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";

const chartConfig = {
    id: {
        label: "ID",
    },
    name: {
        label: "Name",
    },
    currentBalance: {
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

const assetColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
]

const creditColors = [
    "var(--red-chart-1)",
    "var(--red-chart-2)",
    "var(--red-chart-3)",
    "var(--red-chart-4)",
    "var(--red-chart-5)",
]

const InfoCard = ({amount, description}: { amount: number, description: string }) => (
    <div className="bg-primary/10 backdrop-blur-sm w-full md:w-auto px-3 py-2 md:px-4 md:py-3 rounded-md text-center">
        <p className="text-primary text-lg w-fit mx-auto">{currencyParser.format(amount)}</p>
        <p className="text-xs text-neutral-400/90 font-semibold text-nowrap w-fit mx-auto">{description}</p>
    </div>
)

function CustomTooltip({active, payload}: TooltipProps<number, string>) {
    if (active) {
        const item = payload?.[0].payload as Account & {fill: string}
        return (
            <div className="bg-neutral-600/40 rounded-md backdrop-blur-sm flex gap-2 items-center">
                <div className="backdrop-blur-sm gap-2 flex items-center p-2">
                    <div className="w-1 h-8 rounded-full" style={{backgroundColor: item.fill}}></div>
                    <div className="backdrop-blur-sm bg-transparent">
                        <p className="font-semibold">{payload?.[0].name}</p>
                        <p className="">
                            {item.type === "Credit" && "-"}{`${currencyParser.format(payload?.[0].value || 0)}`}
                        </p>
                    </div>
                </div>
            </div>
        );
    } else {
        return null;
    }
}


export function NetWorthCard() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [{data}] = useAtom(accountsAtom);

    const assetAccounts = data?.filter(account => {
        return account.type !== "Loan" && account.type !== "Credit";
    })
        .map((account, index) => {
            const colorIndex = index % assetColors.length;
            return {...account, fill: assetColors[colorIndex]};
        })

    const creditAccounts = data?.filter(account => {
        return account.type === "Credit";
    })
        .map((account, index) => {
            const colorIndex = index % creditColors.length;
            return {...account, fill: creditColors[colorIndex]};
        })

    const allAccounts = [...(assetAccounts ?? []), ...(creditAccounts ?? [])]
    const totalBalance = assetAccounts?.reduce((total, account) => total + account.currentBalance, 0) ?? 0
    const liabilities = data?.reduce((liabilities, account) => {
        if (account.type === "Credit") {
            return liabilities + account.currentBalance;
        }

        return liabilities + 0;
    }, 0) ?? 0

    return (
        <Card className="col-span-full md:col-span-7 bg-primary/10 text-primary">
            <CardHeader className="pb-4 flex-row justify-between items-center">
                <CardTitle className="text-2xl font-normal w-fit">Net Worth</CardTitle>
                <Link to="/accounts" className="w-fit bg-primary/10 hover:bg-neutral-700/40 transition-colors duration-300 p-2 rounded-lg !mt-0">
                    <MoveUpRight className="h-auto w-4 -rotate-12"/>
                </Link>
            </CardHeader>
            <CardContent className="flex md:flex-row flex-col pb-4 gap-4">
                <CardDescription className="flex items-center justify-around gap-8 md:gap-0 md:my-6 md:flex-col">
                    <InfoCard amount={totalBalance - liabilities} description={"Total Equity"}/>
                    <InfoCard amount={totalBalance} description={"Total Balance"}/>
                </CardDescription>
                <ResponsiveContainer height={280} minWidth={200} minHeight={200} className="w-full order-first md:order-none">
                    {data?.length !== 0 ? <ChartContainer config={chartConfig}>
                        <PieChart>
                            <ChartTooltip
                                content={<CustomTooltip/>}
                            />
                            <Pie
                                data={assetAccounts}
                                nameKey="name"
                                dataKey="currentBalance"
                                innerRadius={60}
                                strokeWidth={5}
                                paddingAngle={3}
                            >
                                {assetAccounts?.map((entry) => (
                                    <Cell
                                        key={`${entry.id}::NetWorthCard::AssetPieCell`}
                                        opacity={hoveredIndex === null || hoveredIndex === entry.id ? 1 : 0.3}
                                    />
                                ))}
                            </Pie>
                            <Pie
                                data={creditAccounts}
                                nameKey="name"
                                dataKey="currentBalance"
                                outerRadius={50}
                                innerRadius={20}
                                strokeWidth={5}
                                paddingAngle={5}
                                opacity={hoveredIndex === null ? 1 : 0.4}
                            >
                                {creditAccounts?.map((entry) => (
                                    <Cell
                                        key={`${entry.id}::NetWorthCard::CreditPieCell`}
                                        opacity={hoveredIndex === null || hoveredIndex === entry.id ? 1 : 0.4}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                    :
                    <Skeleton className="w-full h-full bg-primary/10" />}
                </ResponsiveContainer>
                <ScrollArea className="h-64 w-72">
                    <ul className="flex flex-col justify-center gap-6 w-fit pr-6">
                        {allAccounts?.map((account) => (
                            <li
                                key={account.id + "::NetWorthCard::PieLegend"}
                                className="flex items-center gap-3"
                                onMouseEnter={() => setHoveredIndex(account.id)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="w-1 h-8 rounded-full" style={{backgroundColor: account.fill}}/>
                                <div className="flex flex-col">
                                    <span className="text-sm text-zinc-400">{account.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-zinc-300 text-nowrap">
                                            {(account.type === "Credit" ? "-" : "") + currencyParser.format(account.currentBalance)}
                                        </span>
                                        <span className="text-xs text-neutral-400/90">
                                            {account.type === "Credit" && "-"}{(( account.currentBalance / totalBalance) * 100).toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </li>

                        ))}
                    </ul>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

