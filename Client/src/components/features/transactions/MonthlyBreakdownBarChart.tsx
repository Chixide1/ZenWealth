import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import { ComposedChart, Legend, XAxis, YAxis, CartesianGrid, Bar, Line, Tooltip, ResponsiveContainer } from "recharts";
import {FinancialPeriod, MonthlyBreakdown} from "@/types.ts";
import {cn, debitColors, currencyParser, chartColors} from "@/lib/utils.ts";
import { format } from "date-fns";
import {useIsMobile} from "@/hooks/use-mobile.tsx";
import { Tabs, TabsList } from "@radix-ui/react-tabs";
import { TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple, faTable } from "@fortawesome/free-solid-svg-icons";
import { TransactionCategory } from "@/lib/utils.ts";
import {IncomeExpensesTable} from "@/components/features/transactions/IncomeExpensesTable.tsx";

type MonthlyBreakdownBarChartProps = {
    className?: string,
    data: FinancialPeriod[]
}

export function MonthlyBreakdownBarChart({ className, data }: MonthlyBreakdownBarChartProps) {
    const isMobile = useIsMobile();

    // Prepare data for stacked bar chart
    const preparedData = data.map(period => {
        const transformedPeriod = {
            year: period.year,
            month: period.month,
            netProfit: period.totals.netProfit,
            display: format(new Date(period.year, period.month - 1), "MMM yyyy")
        };

        // Group categories by positive and negative values
        Object.entries(period.categories).forEach(([category, amount]) => {
            const categoryName = category as TransactionCategory;

            if (amount >= 0) {
                // Add positive amount to the corresponding category
                transformedPeriod[`positive_${categoryName}`] = amount;
            } else {
                // Add negative amount as absolute value to the corresponding category
                transformedPeriod[`negative_${categoryName}`] = Math.abs(amount);
            }
        });

        return transformedPeriod;
    });

    // Get all unique categories from the data
    const allCategories = new Set<string>();
    data.forEach(period => {
        Object.keys(period.categories).forEach(category => {
            allCategories.add(category);
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
                            <ComposedChart data={preparedData} margin={{ top: 0, right: 0, left: isMobile ? 10: 30, bottom: 20 }}>
                                <XAxis
                                    dataKey="display"
                                    stroke={"grey"}
                                />
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
                                    className="!z-[1000]"
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => {
                                        // Format the value as currency
                                        const formattedValue = currencyParser.format(value);

                                        // Clean up the category name by removing the prefix and formatting
                                        let cleanName = name;

                                        if (cleanName === "netProfit") {
                                            cleanName = "Net Profit";
                                        } else if (cleanName.startsWith("positive_")) {
                                            cleanName = cleanName.replace("positive_", "").replace(/_/g, " ");
                                        } else if (cleanName.startsWith("negative_")) {
                                            cleanName = cleanName.replace("negative_", "").replace(/_/g, " ");
                                        }

                                        return [formattedValue, cleanName];
                                    }}
                                    wrapperClassName="!bg-charcoal/90 max-h-64 !p-4 overflow-y-auto backdrop-blur-xl rounded-md !border-neutral-700"
                                    wrapperStyle={{pointerEvents: "auto"}}
                                />
                                {!isMobile && <Legend formatter={(value: string) => {
                                    if (value === "netProfit") {
                                        return "Net Profit".toUpperCase();
                                    } else if (value.startsWith("positive_")) {
                                        return value.replace("positive_", "").replace(/_/g, " ");
                                    } else if (value.startsWith("negative_")) {
                                        return value.replace("negative_", "").replace(/_/g, " ");
                                    }
                                    return value;
                                }}/>}
                                <CartesianGrid className="stroke-white/30 " strokeDasharray="3 3" />

                                {/* Stacked negative values */}
                                {Array.from(allCategories).map((category, index) => (
                                    <Bar
                                        key={`negative_${category}`}
                                        dataKey={`negative_${category}`}
                                        name={`negative_${category}`}
                                        stackId="negative"
                                        fill={debitColors[index % chartColors.length]}
                                    />
                                ))}

                                {/* Stacked positive values */}
                                {Array.from(allCategories).map((category, index) => (
                                    <Bar
                                        key={`positive_${category}`}
                                        dataKey={`positive_${category}`}
                                        name={`positive_${category}`}
                                        stackId="positive"
                                        fill={chartColors[index % debitColors.length]}
                                    />
                                ))}
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