import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {cn, creditColors, currencyParser} from "@/lib/utils";
import type { Account } from "@/types";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import {AccountsTooltip} from "@/components/shared/AccountsTooltip.tsx";
import {ArrowLink} from "@/components/shared/ArrowLink.tsx";
import {Separator} from "@/components/ui/separator.tsx";

type TotalBalanceCardProps = {
    className?: string
    accounts: Account[]
}

export function LiabilitiesTreeMap({ className, accounts }: TotalBalanceCardProps) {
    const data = accounts
        .map((account, index) => {
            const colorIndex = index % creditColors.length;
            return {...account, fill: creditColors[colorIndex]};
        });
    
    const totalLiabilities = accounts.reduce((total, acc) => total + acc.currentBalance, 0);
    const totalCreditLimit = accounts.reduce((total, acc) => total + acc.availableBalance, 0);
    
    return (
        <Card className={cn("bg-offblack border border-neutral-800", className)}>
            <CardHeader className="flex-row align-items-center justify-between pb-4">
                <CardTitle>Total Liabilities</CardTitle>
                <ArrowLink to={"/accounts"} />
            </CardHeader>
            <CardContent className="pb-2 px-4">
                <ResponsiveContainer className="w-full" height={180}>
                    {data.length > 0 ? 
                            <Treemap
                            data={data}
                            nameKey="name"
                            dataKey="currentBalance"
                            stroke="hsl(var(--offblack))"
                            fill="hsl(var(--offblack))"
                        >
                            <Tooltip content={<AccountsTooltip className="bg-neutral-700/50 text-sm" showNegatives={false}/>}/>
                        </Treemap> 
                        :
                        <div className="text-neutral-400 text-xl w-full flex items-center justify-center my-auto h-full">
                            <p>No Liabilities</p>
                        </div>
                    }
                </ResponsiveContainer>
            </CardContent>
            <CardFooter className="bg-charcoal mx-3 mb-3 rounded-2xl p-2 block">
                <div className="inline-flex gap-4 justify-between items-center w-full border-b border-neutral-700 p-1">
                    <div className="inline-flex flex-col md:flex-row md:gap-2 items-center">
                        <span className="text-primary">{currencyParser.format(totalLiabilities)}</span>
                        <span className="text-sm text-center text-neutral-400">Total Liabilities</span>
                    </div>
                    <Separator orientation="vertical" className="h-10 md:h-5 bg-neutral-700" />
                    <div className="inline-flex flex-col md:flex-row md:gap-2 items-center">
                        <span className="text-primary">{currencyParser.format(totalCreditLimit)}</span>
                        <span className="text-sm text-center text-neutral-400">Remaining Credit Limit</span>
                    </div>
                </div>
                <CardDescription className="rounded-md w-full p-2 text-neutral-400">
                    This chart gives a clear picture of your overall credit use and remaining available credit limit.
                    It doesn't include loans as those are typically associated with underlying assets.
                </CardDescription>
            </CardFooter>
        </Card>
    );
}

export default LiabilitiesTreeMap;

