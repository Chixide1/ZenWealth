import { Label, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { addSpaceBetweenCapitals, chartConfig, cn, currencyParser } from "@/lib/utils.ts";
import type { Account } from "@/types.ts";
import { AccountsTooltip } from "@/components/shared/AccountsTooltip.tsx";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion.tsx";
import { Wallet } from "lucide-react";

type NetWorthCardProps = {
    accounts: Account[]
    className?: string
}

type AccountDetailsCardProps = {
    accountTypes: [string, Account[]][]
    className?: string
    defaultOpenTypes?: string[]
}

export function NetWorthCard({ accounts, className }: NetWorthCardProps) {
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
            const accountElement = document.getElementById(accountId);

            // Scroll to the account with a small delay to allow accordion to open
            setTimeout(() => {
                accountElement?.scrollIntoView({ behavior: "smooth", block: "center" });
                // Add a temporary highlight class
                accountElement?.classList.add("bg-charcoal/50");
                setTimeout(() => {
                    accountElement?.classList.remove("bg-charcoal/50");
                }, 2000);
            }, 100);
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

export function AccountDetailsCard({ accountTypes, className }: AccountDetailsCardProps) {
    return (
        <Card className={cn("bg-offblack border-neutral-800", className)} id="account-details-card">
            <CardHeader>
                <CardTitle>Your Accounts</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple">
                    {accountTypes.map((account) => {
                        // Calculate the total balance for the current account type
                        const totalBalance = account[1].reduce((sum, a) => sum + a.currentBalance, 0);

                        return (
                            <AccordionItem key={account[0]} value={account[0]} className="border-charcoal">
                                <AccordionTrigger className="text-lg" data-accordion-trigger>
                                    <span className="">{account[0]}</span>
                                    <span className="ml-auto mr-2 font-normal">
                                        {currencyParser.format(
                                            account[0] === "Credit" || account[0] === "Loan" ? -totalBalance : totalBalance,
                                        )}
                                    </span>{" "}
                                    {/* Display the total balance */}
                                </AccordionTrigger>
                                <AccordionContent className="divide-y divide-dashed">
                                    {account[1].map((a) => (
                                        <div
                                            key={`${a.id}::AccountDetailsCardAccordion`}
                                            id={`${a.id}::AccountDetailsCardAccordion`}
                                            className="flex items-center gap-2 border-charcoal py-2 first:border-t transition-colors duration-300"
                                        >
                                            <div className="bg-charcoal w-fit h-auto rounded-full p-2">
                                                <Wallet className="h-auto w-5" />
                                            </div>
                                            <div className="">
                                                <p>{a.name}</p>
                                                <p className="text-neutral-400">{addSpaceBetweenCapitals(a.subtype)}</p>
                                            </div>
                                            <div className="ml-auto text-end">
                                                <p>
                                                    {currencyParser.format(
                                                        a.type === "Credit" || a.type === "Loan" ? -a.currentBalance : a.currentBalance,
                                                    )}
                                                </p>
                                                <p className="text-neutral-400">**** **** **** {a.mask}</p>
                                            </div>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
}

