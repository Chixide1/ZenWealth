import { Label, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { chartConfig, cn, currencyParser } from "@/lib/utils.ts";
import type { Account } from "@/types.ts";
import { AccountsTooltip } from "@/components/shared/AccountsTooltip.tsx";
import {AccountsAccordionAtom} from "@/lib/atoms.ts";
import { useAtom } from "jotai";

type NetWorthCardProps = {
    accounts: Account[]
    className?: string
}

export function NetWorthCard({ accounts, className }: NetWorthCardProps) {
    const [items, setItems] = useAtom(AccountsAccordionAtom);
    const debitAccounts = accounts?.filter((account) => account.type === "Depository" || account.type === "Other");
    const creditAccounts = accounts?.filter((account) => account.type === "Credit" || account.type === "Loan");

    const totalBalance = debitAccounts?.reduce((total, account) => total + account.currentBalance, 0) ?? 0;
    const liabilities =
        accounts?.reduce((liabilities, account) => {
            if (account.type === "Credit" || account.type === "Loan") {
                return liabilities + account.currentBalance;
            }

            return liabilities;
        }, 0) ?? 0;

    // Function to handle pie slice click
    const handlePieClick = (data: Account) => {
        if (data && data.id) {
            // Create the account ID and scroll to it
            const accountId = `${data.id}::AccountDetailsCardAccordion`;
            
            if(!items.includes(data.type)) {
                setItems((prev) => [...prev, data.type]);
            }

            // Scroll to the account with a small delay to allow accordion to open
            setTimeout(() => {
                const accountElement = document.getElementById(accountId);
                accountElement?.scrollIntoView({ behavior: "smooth", block: "center" });
                // Add a temporary highlight class
                accountElement?.classList.add("bg-secondary/10");
                setTimeout(() => {
                    accountElement?.classList.remove("bg-secondary/10");
                }, 4000);
            }, 500);
        }
    };

    return (
        <Card className={cn("text-primary bg-offblack", className)}>
            <CardHeader className="px-6 pb-4">
                <div className="flex flex-col items-center justify-center bg-charcoal rounded-lg p-4">
                    <CardTitle className="text-sm text-secondary">Total Net Worth</CardTitle>
                    <span className="text-3xl font-bold text-primary-foreground">
                        {currencyParser.format(totalBalance - liabilities)}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex md:flex-row flex-col pb-4 gap-4">
                <ResponsiveContainer height={280} minWidth={200} minHeight={200} className="w-full order-first md:order-none">
                    <ChartContainer config={chartConfig}>
                        <PieChart>
                            <ChartTooltip content={<AccountsTooltip />} />
                            <Pie
                                data={debitAccounts}
                                nameKey="name"
                                dataKey="currentBalance"
                                innerRadius={70}
                                strokeWidth={5}
                                paddingAngle={3}
                                cornerRadius={4}
                                outerRadius={120}
                                onClick={handlePieClick}
                                className="cursor-pointer"
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-primary text-base font-semibold">
                                                        {currencyParser.format(totalBalance)}
                                                    </tspan>
                                                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-neutral-400 text-sm">
                                                        Assets
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </ResponsiveContainer>
                <ResponsiveContainer height={280} minWidth={200} minHeight={200} className="w-full order-first md:order-none">
                    <ChartContainer config={chartConfig}>
                        <PieChart>
                            <ChartTooltip content={<AccountsTooltip />} />
                            <Pie
                                data={creditAccounts}
                                nameKey="name"
                                dataKey="currentBalance"
                                innerRadius={70}
                                strokeWidth={5}
                                paddingAngle={3}
                                cornerRadius={4}
                                outerRadius={120}
                                onClick={handlePieClick}
                                className="cursor-pointer"
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-primary text-base font-semibold">
                                                        {currencyParser.format(-liabilities)}
                                                    </tspan>
                                                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-neutral-400 text-sm">
                                                        Liabilities
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}