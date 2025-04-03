import { ComposedChart, Legend, XAxis, YAxis, CartesianGrid, Bar, Line, Tooltip, ResponsiveContainer } from "recharts";
import {FinancialPeriod} from "@/types.ts";
import {cn, debitColors, currencyParser, chartColors, categories} from "@/lib/utils.ts";
import { format } from "date-fns";
import {useIsMobile} from "@/hooks/use-mobile.tsx";
import { TransactionCategory } from "@/lib/utils.ts";

type IncomeExpensesBarChartProps = {
    className?: string,
    data: FinancialPeriod[]
}

export function IncomeExpensesBarChart({data, className}: IncomeExpensesBarChartProps) {
    const isMobile = useIsMobile();
    const preparedData = prepareData(data);

    return(
        <ResponsiveContainer width="100%" height={475} className={cn("", className)}>
            <ComposedChart data={preparedData} margin={{ top: 0, right: 0, left: isMobile ? 10: 30, bottom: 20 }}>
                <XAxis
                    dataKey="display"
                    stroke={"grey"}
                />
                {!isMobile && <YAxis stroke={"grey"} tickFormatter={(value: number) => currencyParser.format(value)}/>}
                <Line
                    type="monotone"
                    dataKey="netProfit"
                    stroke="hsl(var(--tertiary))"
                    strokeWidth={2}
                    dot={{stroke: "none", fill: "hsl(var(--tertiary))"}}
                    activeDot={{stroke: "none"}}
                    name="netProfit"
                    className="!z-[1000]"
                />
                <Tooltip
                    formatter={tooltipFormatter}
                    wrapperClassName="!bg-charcoal/90 max-h-64 !p-4 overflow-y-auto backdrop-blur-xl rounded-md !border-neutral-700"
                    wrapperStyle={{pointerEvents: "auto"}}
                />
                <CartesianGrid className="stroke-white/30 " strokeDasharray="3 3" />

                {/* Stacked income values */}
                {categories.map((category, index) => (
                    <Bar
                        key={`MonthlyBreakdownChartBar::income_${category}`}
                        dataKey={`income_${category}`}
                        name={`income_${category}`}
                        stackId="income"
                        fill={debitColors[index % chartColors.length]}
                    />
                ))}

                {/* Stacked expense values */}
                {categories.map((category, index) => (
                    <Bar
                        key={`MonthlyBreakdownChartBar::expense_${category}`}
                        dataKey={`expense_${category}`}
                        name={`expense_${category}`}
                        stackId="expense"
                        fill={chartColors[index % debitColors.length]}
                    />
                ))}

                {!isMobile && <Legend formatter={legendFormatter}/>}
            </ComposedChart>
        </ResponsiveContainer>
    )
}

type TransformedPeriod = {
    year: number;
    month: number;
    netProfit: number;
    display: string;
    [key: string]: number | string;
}

/**
    Util to prepare the provided data for the stacked bar chart
**/
function prepareData(data: FinancialPeriod[]){
    return data.map(period => {
        const transformedPeriod: TransformedPeriod = {
            year: period.year,
            month: period.month,
            netProfit: period.totals.netProfit,
            display: format(new Date(period.year, period.month - 1), "MMM yyyy")
        };

        // Group categories by income and expenses
        Object.entries(period.categories).forEach(([category, amount]) => {
            const categoryName = category as TransactionCategory;

            if (amount >= 0) {
                transformedPeriod[`expense_${categoryName}`] = amount;
            } else {
                transformedPeriod[`income_${categoryName}`] = Math.abs(amount);
            }
        });

        return transformedPeriod;
    });
}

function tooltipFormatter(value: number, name: string) {
    // Format the value as currency
    const formattedValue = currencyParser.format(value);

    // Clean up the category name by removing the prefix and formatting
    let cleanName = name;

    if (cleanName === "netProfit") {
        cleanName = "Net Profit";
    } else if (cleanName.startsWith("expense_")) {
        cleanName = cleanName.replace("expense_", "").replace(/_/g, " ");
    } else if (cleanName.startsWith("income_")) {
        cleanName = cleanName.replace("income_", "").replace(/_/g, " ");
    }

    return [formattedValue, cleanName];
}

function legendFormatter(value: string) {
    if (value === "netProfit") {
        return "Net Profit".toUpperCase();
    } else if (value.startsWith("expense_")) {
        return value.replace("expense_", "").replace(/_/g, " ");
    } else if (value.startsWith("income_")) {
        return value.replace("income_", "").replace(/_/g, " ");
    }
    return value;
}