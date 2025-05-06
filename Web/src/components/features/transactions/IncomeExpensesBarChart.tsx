import { ComposedChart, Legend, XAxis, YAxis, CartesianGrid, Bar, Line, Tooltip, ResponsiveContainer, TooltipProps, LegendProps } from "recharts";
import {FinancialPeriod} from "@/types.ts";
import {cn, currencyParser, chartColors, categories} from "@/lib/utils.ts";
import { format } from "date-fns";
import {useIsMobile} from "@/hooks/use-mobile.tsx";
import { TransactionCategory } from "@/lib/utils.ts";

// Create a mapping of categories to consistent colors
const categoryColorMap: Record<string, string> = {};
categories.forEach((category, index) => {
    // Use chartColors for all categories to keep them consistent
    categoryColorMap[category] = chartColors[index % chartColors.length];
});

type IncomeExpensesBarChartProps = {
    className?: string,
    data: FinancialPeriod[]
}

export function IncomeExpensesBarChart({data, className}: IncomeExpensesBarChartProps) {
    const isMobile = useIsMobile();
    const preparedData = prepareData(data);

    return (
        <div className="w-full overflow-x-auto">
            <div style={{ minWidth: "500px", width: "100%", height: "475px" }}>
                <ResponsiveContainer width="100%" height="100%" className={cn(className)}>
                    <ComposedChart data={preparedData} margin={{ top: 0, right: 20, left: 50, bottom: 20 }}>
                        <XAxis
                            dataKey="display"
                            stroke={"grey"}
                        />
                        <YAxis stroke={"grey"} tickFormatter={(value: number) => currencyParser.format(value)}/>
                        <Tooltip
                            content={<CustomTooltip />}
                            wrapperClassName="!bg-charcoal/90 max-h-64 !p-4 overflow-y-auto backdrop-blur-xl rounded-md !border-neutral-700"
                            wrapperStyle={{pointerEvents: "auto"}}
                        />
                        <CartesianGrid className="stroke-white/30 " strokeDasharray="3 3" />

                        {/* Stacked income values */}
                        {categories.map((category) => (
                            <Bar
                                key={`MonthlyBreakdownChartBar::income_${category}`}
                                dataKey={`income_${category}`}
                                name={`income_${category}`}
                                stackId="income"
                                fill={categoryColorMap[category]} // Use consistent color from map
                            />
                        ))}

                        {/* Stacked expense values */}
                        {categories.map((category) => (
                            <Bar
                                key={`MonthlyBreakdownChartBar::expense_${category}`}
                                dataKey={`expense_${category}`}
                                name={`expense_${category}`}
                                stackId="expense"
                                fill={categoryColorMap[category]} // Use consistent color from map
                            />
                        ))}

                        <Line
                            type="monotone"
                            dataKey="netProfit"
                            stroke="hsl(var(--secondary))"
                            strokeWidth={2}
                            dot={{stroke: "none", fill: "hsl(var(--secondary))"}}
                            activeDot={{stroke: "none"}}
                            strokeDasharray={"5 5"}
                            name="netProfit"
                        />

                        {!isMobile && <Legend content={<CustomLegend categoryColorMap={categoryColorMap} />} />}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}


// Custom tooltip component to group income and expenses
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;
    
    // Group items by income and expense
    const incomeItems = payload.filter((item) => item.name?.startsWith('income_'));
    const expenseItems = payload.filter((item) => item.name?.startsWith('expense_'));
    const netProfit = payload.find((item) => item.name === 'netProfit');
    
    return (
        <div className="p-2 text-sm bg-charcoal/90 rounded-md backdrop-blur-xl border border-neutral-700 max-h-[75%] overflow-auto">
            <p className="font-bold mb-2">{label}</p>
            
            {/* Income section */}
            {incomeItems.length > 0 && (
                <div className="mb-2">
                    <p className="font-semibold underline">Income</p>
                    {incomeItems.map((item, index) => {
                        if (item.value === 0) return null;
                        const categoryName = item.name?.replace("income_", "").replace(/_/g, " ");
                        // Get category base name to look up in color map
                        const category = item.name?.replace("income_", "") ?? "";
                        const color = categoryColorMap[category] || item.color;
                        
                        return (
                            <div key={`income-${index}`} className="flex justify-between">
                                <span style={{ color }}>{categoryName}</span>
                                <span className="ml-4">{currencyParser.format(item.value ?? 0)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {/* Expense section */}
            {expenseItems.length > 0 && (
                <div className="mb-2">
                    <p className="font-semibold underline">Expenses</p>
                    {expenseItems.map((item, index: number) => {
                        if (item.value === 0) return null;
                        const categoryName = item.name?.replace("expense_", "").replace(/_/g, " ");
                        // Get category base name to look up in color map
                        const category = item.name?.replace("expense_", "");
                        const color = categoryColorMap[category ?? ""] || item.color;
                        
                        return (
                            <div key={`expense-${index}`} className="flex justify-between">
                                <span style={{ color }}>{categoryName}</span>
                                <span className="ml-4">{currencyParser.format(item.value ?? 0)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {/* Net profit section */}
            {netProfit && (
                <div className="mt-2 pt-2 border-t border-neutral-600">
                    <div className="flex justify-between font-bold">
                        <span style={{ color: netProfit.color }}>Net Profit</span>
                        <span className="ml-4">{currencyParser.format(netProfit.value ?? 0)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Custom legend component to display unique categories
const CustomLegend = (props: LegendProps & {categoryColorMap: Record<string, string>}) => {
    const { payload, categoryColorMap } = props;
    if (!payload) return null;
    
    // Create a map to store unique categories
    const uniqueCategories = new Map();
    
    // Process the payload to extract unique categories
    payload.forEach((entry) => {
        const name = entry.value as string;
        
        // Skip "income_" and "expense_" prefixes for the same category
        let categoryKey = name;
        let displayName = name;
        
        if (name === "netProfit") {
            categoryKey = "netProfit";
            displayName = "NET PROFIT";
        } else if (name.startsWith("income_") || name.startsWith("expense_")) {
            // Extract the actual category name
            categoryKey = name.replace(/^(income_|expense_)/, "");
            displayName = categoryKey.replace(/_/g, " ");
        }
        
        // Only add if we haven't seen this category yet
        if (!uniqueCategories.has(categoryKey)) {
            // Use the consistent color from the map for this category
            const color = categoryKey === "netProfit" 
                ? entry.color 
                : categoryColorMap[categoryKey] || entry.color;
                
            uniqueCategories.set(categoryKey, {
                displayName,
                color,
                type: entry.type
            });
        }
    });
    
    return (
        <ul className="flex flex-wrap justify-center gap-2 mt-2 bg-charcoal/90 p-4 rounded-md backdrop-blur-xl border border-neutral-700">
            {Array.from(uniqueCategories.entries()).map(([key, value]) => (
                <li key={key} className="flex items-center">
                    <span 
                        className="inline-block w-3 h-3 mr-1"
                        style={{ backgroundColor: value.color }}
                    />
                    <span style={{color: value.color}}>{value.displayName}</span>
                </li>
            ))}
        </ul>
    );
};

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