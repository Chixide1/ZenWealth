import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {cn, creditColors} from "@/lib/utils"
import type { Account } from "@/types"
import { Treemap, ResponsiveContainer, Tooltip } from "recharts"
import {CustomTooltip} from "@/components/shared/CustomTooltip.tsx";

type TotalBalanceCardProps = {
    className?: string
    accounts: Account[]
}

export function TotalLiabilitiesCard({ className, accounts }: TotalBalanceCardProps) {
    const data = accounts.filter((account) => account.type !== "Credit" && account.type !== "Loan")
        .map((account, index) => {
            const colorIndex = index % creditColors.length;
            return {...account, fill: creditColors[colorIndex]};
        })
    return (
        <Card className={cn("bg-[hsl(0,0%,10%)]", className)}>
            <CardHeader>
                <CardTitle>Total Liabilities</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer className="w-full" height={250}>
                    <Treemap
                        data={data}
                        nameKey="name"
                        dataKey="currentBalance"
                        stroke="hsl(0,0%,10%)"
                        fill="hsl(0,0%,10%)"
                        // strokeWidth={2}
                        // content={<CustomizedContent />}
                    >
                        <Tooltip content={<CustomTooltip className="bg-neutral-700/50" />}/>
                        {/*<defs>*/}
                        {/*    <pattern id="diagonalStripes" patternUnits="userSpaceOnUse" width="8" height="8">*/}
                        {/*        <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />*/}
                        {/*    </pattern>*/}
                        {/*</defs>*/}
                    </Treemap>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export default TotalLiabilitiesCard

const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, size } = props

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: depth < 2 ? "hsl(var(--primary) / 0.125)" : "hsl(0,0%,10%)",
                    stroke: "hsl(0,0%,10%)",
                    strokeWidth: 5,
                }}
                className="m-4"
            />
            {depth === 1 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 7}
                    textAnchor="middle"
                    fill="hsl(var(--accent))"
                    fontSize={20}
                    fontWeight="bold"
                >
                    {name}
                </text>
            )}
            {/*{depth === 2 && (*/}
            {/*    <>*/}
            {/*        <text x={x + 4} y={y + 18} fill="hsl(var(--foreground))" fontSize={12} fillOpacity={1}>*/}
            {/*            {name}*/}
            {/*        </text>*/}
            {/*        <text x={x + 4} y={y + height - 6} fill="hsl(var(--foreground))" fontSize={10} fillOpacity={0.8}>*/}
            {/*            {size}*/}
            {/*        </text>*/}
            {/*    </>*/}
            {/*)}*/}
        </g>
    )
}

