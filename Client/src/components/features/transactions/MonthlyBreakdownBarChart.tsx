import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import { ComposedChart, Legend, XAxis, YAxis, CartesianGrid, Bar, Line, Tooltip, ResponsiveContainer } from "recharts";
import { MonthlyBreakdown } from "@/types.ts";
import {cn, debitColors, currencyParser, chartColors} from "@/lib/utils.ts";
import { format } from "date-fns";
import {useIsMobile} from "@/hooks/use-mobile.tsx";
import { Tabs, TabsList } from "@radix-ui/react-tabs";
import { TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple, faTable } from "@fortawesome/free-solid-svg-icons";
import IncomeExpensesTable from "./IncomeExpensesTable";

type MonthlyBreakdownBarChartProps = {
    className?: string,
    data: MonthlyBreakdown[]
}

export function MonthlyBreakdownBarChart({ className, data }: MonthlyBreakdownBarChartProps) {
    const isMobile = useIsMobile();
    
    // Transform the data to format needed for the chart
    const chartData = data.map(item => {
        // Create a Date object from year and month (month is 0-indexed in JS Date)
        const date = new Date(item.year, item.month - 1);
        const formattedDate = format(date, "MMM yyyy");

        // Create an object with the formatted date and netProfit
        const result: Record<string, unknown> & {
            month: string, netProfit: number
        } = {
            month: formattedDate,
            netProfit: item.netProfit,
        };

        // Add each income category as a separate property
        item.income.forEach(incomeItem => {
            // Prefix with "income_" to avoid potential name collisions with expense categories
            result[`income_${incomeItem.category}`] = incomeItem.total;
        });

        // Add each expense category as a separate property
        item.expenditure.forEach(expenseItem => {
            // Prefix with "expense_" to distinguish from income categories
            result[`expense_${expenseItem.category}`] = expenseItem.total;
        });

        return result;
    });

    // Get all unique income categories across all data points
    const incomeCategories = new Set<string>();
    data.forEach(item => {
        item.income.forEach(incomeItem => {
            incomeCategories.add(incomeItem.category);
        });
    });

    // Get all unique expense categories across all data points
    const expenseCategories = new Set<string>();
    data.forEach(item => {
        item.expenditure.forEach(expenseItem => {
            expenseCategories.add(expenseItem.category);
        });
    });

    return (
        <Card className={cn("bg-offblack", className)}>
            <Tabs defaultValue="BarChart">
                <CardHeader className="flex flex-col items-center justify-between space-y-2 md:space-y-0 md:flex-row pb-2">
                    <CardTitle>Income vs Expenses overview</CardTitle>
                    <TabsList className="bg-background rounded-md p-1 space-x-1">
                        <TabsTrigger value="BarChart" className="bg-transparent rounded-sm p-2">
                            <FontAwesomeIcon icon={faChartSimple} />
                        </TabsTrigger>
                        <TabsTrigger value="Table" className="bg-transparent rounded-sm p-2">
                            <FontAwesomeIcon icon={faTable} />
                        </TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent className="p-2 md:p-6">
                    <TabsContent value="BarChart">
                        <ResponsiveContainer width="100%" height={475}>
                            <ComposedChart data={chartData} margin={{ top: 0, right: 0, left: isMobile ? 10: 30, bottom: 20 }}>
                                <XAxis dataKey="month" stroke={"grey"}/>
                                {!isMobile && <YAxis stroke={"grey"} tickFormatter={(value: number) => currencyParser.format(value)}/>}
                                {/* Net profit as a line */}
                                <Line
                                    type="monotone"
                                    dataKey="netProfit"
                                    stroke="hsl(var(--tertiary))"
                                    strokeWidth={2}
                                    dot={{stroke: "none", fill: "hsl(var(--tertiary))"}}
                                    activeDot={{stroke: "none"}}
                                    name="netProfit"
                                    z={1000}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => {
                                        // Format the value as currency
                                        const formattedValue = currencyParser.format(value);

                                        // Clean up the category name by removing the prefix and formatting
                                        let cleanName = name.replace(/expense_|income_/gi, "").replace(/_/g, " ");
                                        
                                        if (cleanName === "netProfit") {
                                            cleanName = "Net Profit";
                                        }

                                        return [formattedValue, cleanName];
                                    }}
                                    wrapperClassName="!bg-charcoal/90 max-h-64 !p-4 overflow-y-auto backdrop-blur-xl rounded-md !border-neutral-700"
                                    wrapperStyle={{pointerEvents: "auto"}}
                                />
                                {!isMobile && <Legend formatter={(value: string) => {
                                    if (value === "netProfit") {
                                        return "Net Profit".toUpperCase();
                                    }

                                    return value.replace(/expense_|income_/gi, "").replace(/_/g, " ");
                                }}/>}
                                <CartesianGrid className="stroke-white/30 " strokeDasharray="3 3" />

                                {/* Income categories as stacked bars */}
                                {Array.from(incomeCategories).map((category, index) => {
                                    return (
                                        <Bar
                                            key={`income_${category}`}
                                            dataKey={`income_${category}`}
                                            stackId="income"
                                            fill={debitColors[index % debitColors.length]}
                                            name={`income_${category}`}
                                        />
                                    );
                                })}

                                {/* Expense categories as stacked bars (with a different stackId) */}
                                {Array.from(expenseCategories).map((category, index) => {
                                    return (
                                        <Bar
                                            key={`expense_${category}`}
                                            dataKey={`expense_${category}`}
                                            stackId="expense"
                                            fill={chartColors[index % chartColors.length]}
                                            name={`expense_${category}`}
                                        />
                                    );
                                })}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="Table">
                        <IncomeExpensesTable data={data} />
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    );
}