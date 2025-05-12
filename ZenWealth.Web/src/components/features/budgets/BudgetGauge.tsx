import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLink } from "@/components/shared/ArrowLink";
import {Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {cn, currencyParser} from "@/lib/utils.ts";

const RADIAN = Math.PI / 180;

type NeedleProps = {
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    value: number,
    color: string,
    total: number,
    classname?: string,
}

type GaugeProps = {
    spent: number,
    limit: number,
    segments?: number,
    className?: string
}
export function BudgetGauge({ spent = 0, limit = 100, segments = 60, className }: GaugeProps) {
    const safeMax = limit > 0 ? limit : 1; // Prevent division by zero
    const safeValue = Math.max(0, Math.min(spent, safeMax)); // Ensure value is between 0 and max
    const safePercentage = (safeValue / safeMax) * 100;
    const percentage = (spent / limit) * 100;

    const data = Array.from({ length: segments }, (_, index) => ({
        value: 100 / segments,
        isActive: (index / segments) * 100 <= safePercentage,
    }));

    const needleData: NeedleProps = {
        cx: 135,
        cy: 145,
        innerRadius: 90,
        outerRadius: 130,
        value: 0,
        total: 0,
        color: percentage > 100 ? "hsl(var(--destructive))" : "hsl(var(--secondary))",
    };
    
    return (
        <Card className={cn("bg-background backdrop-blur-sm", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Monthly Budget Spending</CardTitle>
                <ArrowLink to="/budgets" />
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row space-y-4 overflow-hidden relative">
                <div className="flex w-fit relative min-w-72 mx-auto">
                    <ResponsiveContainer height={160} minWidth={220} className="w-fit">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                startAngle={180}
                                endAngle={0}
                                paddingAngle={2}
                                {...needleData}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        className={`stroke-0 ${entry.isActive ? (percentage > 100 ? "fill-red-500" : "fill-secondary") : "fill-secondary/5"}`}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <Needle
                        {...needleData}
                        value={safePercentage}
                        total={100}
                        classname="absolute h-full w-full pl-1"
                    />
                </div>
                <CardDescription className="w-full flex flex-col items-center justify-center">
                    <p className={`text-2xl font-bold ${percentage > 100 ? "text-red-500" : "text-secondary"}`}>
                        {percentage ? percentage?.toFixed(2) : 0.00}%
                    </p>
                    <p className="text-lg text-neutral-400 mt-5 md:mt-auto">You have spent</p>
                    <p className="text-neutral-400 text-lg">
                        <span className="text-primary">{currencyParser.format(spent)} </span>
                        out of {currencyParser.format(limit)}</p>
                </CardDescription>
            </CardContent>
        </Card>
    );
}

function Needle({cx, cy, innerRadius, outerRadius, value, color, total, classname}: NeedleProps){
    const ang = 180.0 * (1 - value / total);
    const length = (innerRadius + 2 * outerRadius) / 5;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = 5;
    const x0 = cx + 5;
    const y0 = cy + 5;
    const xba = x0 + r * sin;
    const yba = y0 - r * cos;
    const xbb = x0 - r * sin;
    const ybb = y0 + r * cos;
    const xp = x0 + length * cos;
    const yp = y0 + length * sin;

    return (
        <svg className={cn("",classname)}>
            <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
            <path d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`} stroke="#none" fill={color} />,
        </svg>
    );
}