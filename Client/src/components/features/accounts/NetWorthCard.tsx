﻿import {Cell, Pie, PieChart, ResponsiveContainer} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart";

import {ScrollArea} from "@/components/ui/scroll-area";
import {useState} from "react";
import {assetColors, chartConfig, cn, creditColors, currencyParser} from "@/lib/utils.ts";
import {Account} from "@/types.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {AccountsTooltip} from "@/components/shared/AccountsTooltip.tsx";

type NetWorthCardProps = {
    accounts: Account[]
    className?: string
}

export function NetWorthCard({accounts, className}: NetWorthCardProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const debitAccounts = accounts?.filter(account => {
        return account.type !== "Credit";
    })
        .map((account, index) => {
            const colorIndex = index % assetColors.length;
            return {...account, fill: assetColors[colorIndex]};
        });

    const creditAccounts = accounts?.filter(account => {
        return account.type === "Credit";
    })
        .map((account, index) => {
            const colorIndex = index % creditColors.length;
            return {...account, fill: creditColors[colorIndex]};
        });

    const allAccounts = [...(debitAccounts ?? []), ...(creditAccounts ?? [])];
    const totalBalance = debitAccounts?.reduce((total, account) => total + account.currentBalance, 0) ?? 0;
    const liabilities = accounts?.reduce((liabilities, account) => {
        if (account.type === "Credit") {
            return liabilities + account.currentBalance;
        }

        return liabilities;
    }, 0) ?? 0;
    
    return (
        <Card className={cn("bg-transparent text-primary border-0", className)}>
            <CardHeader className="pb-4 flex-row justify-between items-center">
                <CardTitle className="text-xl w-fit">Net Worth</CardTitle>
            </CardHeader>
            <CardContent className="flex md:flex-row flex-col pb-4 gap-4">
                <CardDescription className="flex items-center justify-around gap-8 md:gap-0 md:my-6 md:flex-col">
                    <InfoBox amount={totalBalance - liabilities} description={"Total Equity"}/>
                    <InfoBox amount={totalBalance} description={"Total Balance"}/>
                </CardDescription>
                <ResponsiveContainer height={280} minWidth={200} minHeight={200} className="w-full order-first md:order-none">
                    {accounts?.length !== 0 ? <ChartContainer config={chartConfig}>
                        <PieChart>
                            <ChartTooltip
                                content={<AccountsTooltip/>}
                            />
                            <Pie
                                data={debitAccounts}
                                nameKey="name"
                                dataKey="currentBalance"
                                innerRadius={60}
                                strokeWidth={5}
                                paddingAngle={3}
                            >
                                {debitAccounts?.map((entry) => (
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
                        <Skeleton className="w-full h-full bg-background" />}
                </ResponsiveContainer>
                <ScrollArea className="h-64 md:w-72 w-full pt-5 md:pt-0">
                    <ul className="flex flex-col justify-center gap-2 md:gap-6 w-full md:w-fit pr-6">
                        {allAccounts?.map((account) => (
                            <li
                                key={account.id + "::NetWorthCard::PieLegend"}
                                className="flex items-center gap-2 md:gap-3 w-full"
                                onMouseEnter={() => setHoveredIndex(account.id)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="w-1 h-1 md:h-8 rounded-full mb-auto mt-2.5 md:my-0" style={{backgroundColor: account.fill}}/>
                                <div className="flex md:flex-col justify-between md:justify-normal w-full">
                                    <span className="text-sm text-primary">{account.name}</span>
                                    <div className="flex items-end md:items-center md:gap-2 flex-col md:flex-row">
                                        <span className="text-sm text-neutral-300 text-nowrap">
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
    );
}

const InfoBox = ({amount, description}: { amount: number, description: string }) => (
    <div className="bg-primary/[0.125] w-full md:w-auto px-3 py-2 md:px-4 md:py-3 rounded-md text-center border border-neutral-700">
        <p className="text-primary text-lg w-fit mx-auto">{currencyParser.format(amount)}</p>
        <p className="text-xs text-neutral-400/90 font-semibold text-nowrap w-fit mx-auto">{description}</p>
    </div>
);