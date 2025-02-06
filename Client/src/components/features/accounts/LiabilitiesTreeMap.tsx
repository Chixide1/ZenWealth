import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {cn, creditColors} from "@/lib/utils"
import type { Account } from "@/types"
import { Treemap, ResponsiveContainer, Tooltip } from "recharts"
import {CustomTooltip} from "@/components/shared/CustomTooltip.tsx";
import {ArrowLink} from "@/components/shared/ArrowLink.tsx";

type TotalBalanceCardProps = {
    className?: string
    accounts: Account[]
}

export function LiabilitiesTreeMap({ className, accounts }: TotalBalanceCardProps) {
    const data = accounts
        .map((account, index) => {
            const colorIndex = index % creditColors.length;
            return {...account, fill: creditColors[colorIndex]};
        })
    return (
        <Card className={cn("bg-[hsl(0,0%,10%)] border border-neutral-800", className)}>
            <CardHeader className="flex-row align-items-center justify-between">
                <CardTitle>Total Liabilities</CardTitle>
                <ArrowLink to={"/accounts"} />
            </CardHeader>
            <CardContent>
                <ResponsiveContainer className="w-full" height={250}>
                    {data.length > 0 ? 
                            <Treemap
                            data={data}
                            nameKey="name"
                            dataKey="currentBalance"
                            stroke="hsl(0,0%,10%)"
                            fill="hsl(0,0%,10%)"
                        >
                            <Tooltip content={<CustomTooltip className="bg-neutral-700/50 text-sm"/>}/>
                        </Treemap> :
                        <div className="text-neutral-400 text-xl w-full flex items-center justify-center my-auto h-full">
                            <p>No Liabilities</p>
                        </div>
                    }
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export default LiabilitiesTreeMap

