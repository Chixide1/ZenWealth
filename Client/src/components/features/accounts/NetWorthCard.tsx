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
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart"
import {accountsAtom} from "@/lib/atoms.ts";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useState} from "react";
import {assetColors, chartConfig, creditColors, currencyParser} from "@/lib/utils.ts";
import { TooltipProps } from 'recharts';
import {Account} from "@/types.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {ArrowLink} from "@/components/shared/ArrowLink.tsx";

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
        <Card className="col-span-full md:col-span-7 bg-primary/10 text-primary backdrop-blur-sm">
            <CardHeader className="pb-4 flex-row justify-between items-center">
                <CardTitle className="text-xl w-fit">Net Worth</CardTitle>
                <ArrowLink to="/accounts" />
            </CardHeader>
            <CardContent className="flex md:flex-row flex-col pb-4 gap-4">
                <CardDescription className="flex items-center justify-around gap-8 md:gap-0 md:my-6 md:flex-col">
                    <InfoBox amount={totalBalance - liabilities} description={"Total Equity"}/>
                    <InfoBox amount={totalBalance} description={"Total Balance"}/>
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
                <ScrollArea className="h-64 md:w-72 w-full pt-5 md:pt-0">
                    <ul className="flex flex-col justify-center gap-6 w-full md:w-fit pr-6">
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
    )
}

const InfoBox = ({amount, description}: { amount: number, description: string }) => (
    <div className="bg-primary/10 backdrop-blur-sm w-full md:w-auto px-3 py-2 md:px-4 md:py-3 rounded-md text-center">
        <p className="text-primary text-lg w-fit mx-auto">{currencyParser.format(amount)}</p>
        <p className="text-xs text-neutral-400/90 font-semibold text-nowrap w-fit mx-auto">{description}</p>
    </div>
)

function CustomTooltip({active, payload}: TooltipProps<number, string>) {
    if (active) {
        const item = payload?.[0].payload as Account & { fill: string }
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
    }
    
    return null;
}