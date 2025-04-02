import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {categories, currencyParser, TransactionCategory} from "@/lib/utils.ts";

export type FinancialPeriod = {
    year: number;
    month: number;
    categories: Record<TransactionCategory, number>;
    totals: {
        income: number;
        expenses: number;
        netProfit: number;
    };
};

interface FinancialTableProps {
    data: FinancialPeriod[];
}

export const IncomeExpensesTable: React.FC<FinancialTableProps> = ({ data }) => {
    // Format number as currency
    const formatCurrency = (amount: number) => {
        return currencyParser.format(amount);
    };

    // Get month name
    const getMonthName = (month: number) => {
        return new Date(2024, month - 1).toLocaleString("default", { month: "short" });
    };

    // Group categories by type (income vs expense)
    const incomeCategories = ["INCOME", "TRANSFER_IN"];
    const expenseCategories = categories.filter(cat => !incomeCategories.includes(cat));

    // State for expanded sections
    const [expandedSections, setExpandedSections] = React.useState({
        income: true,
        expenses: true
    });

    const toggleSection = (section: "income" | "expenses") => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section]
        });
    };

    // Get subcategories for display
    const getSubcategories = (data: FinancialPeriod[]) => {
        // Find all unique subcategories that have values
        const subcategories = new Set<string>();

        data.forEach(period => {
            Object.entries(period.categories).forEach(([category, value]) => {
                if (value > 0) {
                    subcategories.add(category);
                }
            });
        });

        return Array.from(subcategories);
    };

    const displayedSubcategories = getSubcategories(data);

    // Get icon for category
    const getCategoryIcon = (category: string) => {
        switch(category) {
        case "INCOME":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="inline mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            );
        case "RENT_AND_UTILITIES":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="inline mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            );
        case "TRANSFER_IN":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="inline mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 6 5 5-5 5"/><path d="M2 11h20"/></svg>
            );
        case "FOOD_AND_DRINK":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="inline mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            );
        default:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="inline mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            );
        }
    };

    // Format category name for display
    const formatCategoryName = (category: string) => {
        return category
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    return (
        <div className="w-full border rounded-lg ">

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="-">
                            <TableHead className="text-slate-300">Category</TableHead>
                            {data.map((period) => (
                                <TableHead key={`${period.year}-${period.month}`} className="text-right text-slate-300">
                                    {getMonthName(period.month)} {period.year}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {/* Income Row with dropdown arrow */}
                        <TableRow className="">
                            <TableCell className="font-medium cursor-pointer" onClick={() => toggleSection("income")}>
                                <div className="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-2"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ transform: expandedSections.income ? "rotate(0deg)" : "rotate(-90deg)" }}
                                    >
                                        <path d="m6 9 6 6 6-6"/>
                                    </svg>
                                    Income
                                </div>
                            </TableCell>
                            {data.map((period) => (
                                <TableCell key={`income-${period.year}-${period.month}`} className="text-right font-medium">
                                    {formatCurrency(period.totals.income)}
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* Income Subcategories */}
                        {expandedSections.income && displayedSubcategories
                            .filter(category => incomeCategories.includes(category))
                            .map(category => (
                                <TableRow key={`row-${category}`} className="-">
                                    <TableCell className="pl-8 text-slate-400">
                                        {getCategoryIcon(category)}
                                        {formatCategoryName(category)}
                                    </TableCell>
                                    {data.map(period => (
                                        <TableCell key={`cell-${category}-${period.year}-${period.month}`} className="text-right">
                                            {formatCurrency(period.categories[category as TransactionCategory] || 0)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        }

                        {/* Expenses Row with dropdown arrow */}
                        <TableRow className="">
                            <TableCell className="font-medium cursor-pointer" onClick={() => toggleSection("expenses")}>
                                <div className="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-2"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ transform: expandedSections.expenses ? "rotate(0deg)" : "rotate(-90deg)" }}
                                    >
                                        <path d="m6 9 6 6 6-6"/>
                                    </svg>
                                    Expenses
                                </div>
                            </TableCell>
                            {data.map((period) => (
                                <TableCell key={`expenses-${period.year}-${period.month}`} className="text-right font-medium">
                                    {formatCurrency(period.totals.expenses)}
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* Expense Subcategories */}
                        {expandedSections.expenses && displayedSubcategories
                            .filter(category => expenseCategories.includes(category))
                            .map(category => (
                                <TableRow key={`row-${category}`} className="-">
                                    <TableCell className="pl-8 text-slate-400">
                                        {getCategoryIcon(category)}
                                        {formatCategoryName(category)}
                                    </TableCell>
                                    {data.map(period => (
                                        <TableCell key={`cell-${category}-${period.year}-${period.month}`} className="text-right">
                                            {formatCurrency(period.categories[category as TransactionCategory] || 0)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        }

                        {/* Net Profit Row */}
                        <TableRow className="-">
                            <TableCell className="font-medium">Net profit</TableCell>
                            {data.map((period) => (
                                <TableCell key={`profit-${period.year}-${period.month}`} className="text-right font-medium">
                                    {formatCurrency(period.totals.netProfit)}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

// Example usage with sample data
const FinancialTableWithData = () => {
    // Sample data based on the image
    const sampleData: FinancialPeriod[] = [
        {
            year: 2024,
            month: 1, // January
            categories: {
                "INCOME": 47672,
                "BANK_FEES": 0,
                "HOME_IMPROVEMENT": 0,
                "RENT_AND_UTILITIES": 7200,
                "ENTERTAINMENT": 0,
                "TRANSFER_IN": 0,
                "FOOD_AND_DRINK": 0,
                "LOAN_PAYMENTS": 0,
                "TRANSFER_OUT": 0,
                "GENERAL_MERCHANDISE": 0,
                "MEDICAL": 0,
                "TRANSPORTATION": 0,
                "GENERAL_SERVICES": 0,
                "PERSONAL_CARE": 0,
                "TRAVEL": 0,
                "GOVERNMENT_AND_NON_PROFIT": 0,
                "OTHER": 10500
            },
            totals: {
                income: 47672,
                expenses: 10500,
                netProfit: 37172
            }
        },
        {
            year: 2024,
            month: 2, // February
            categories: {
                "INCOME": 38400,
                "BANK_FEES": 0,
                "HOME_IMPROVEMENT": 0,
                "RENT_AND_UTILITIES": 7200,
                "ENTERTAINMENT": 0,
                "TRANSFER_IN": 0,
                "FOOD_AND_DRINK": 0,
                "LOAN_PAYMENTS": 0,
                "TRANSFER_OUT": 0,
                "GENERAL_MERCHANDISE": 0,
                "MEDICAL": 0,
                "TRANSPORTATION": 0,
                "GENERAL_SERVICES": 0,
                "PERSONAL_CARE": 0,
                "TRAVEL": 0,
                "GOVERNMENT_AND_NON_PROFIT": 0,
                "OTHER": 7231
            },
            totals: {
                income: 38400,
                expenses: 7231,
                netProfit: 31169
            }
        },
        {
            year: 2024,
            month: 3, // March
            categories: {
                "INCOME": 32750,
                "BANK_FEES": 0,
                "HOME_IMPROVEMENT": 0,
                "RENT_AND_UTILITIES": 7200,
                "ENTERTAINMENT": 0,
                "TRANSFER_IN": 0,
                "FOOD_AND_DRINK": 0,
                "LOAN_PAYMENTS": 0,
                "TRANSFER_OUT": 0,
                "GENERAL_MERCHANDISE": 0,
                "MEDICAL": 0,
                "TRANSPORTATION": 0,
                "GENERAL_SERVICES": 0,
                "PERSONAL_CARE": 0,
                "TRAVEL": 0,
                "GOVERNMENT_AND_NON_PROFIT": 0,
                "OTHER": 12642
            },
            totals: {
                income: 32750,
                expenses: 12642,
                netProfit: 20108
            }
        },
        {
            year: 2024,
            month: 4, // April
            categories: {
                "INCOME": 41200,
                "BANK_FEES": 0,
                "HOME_IMPROVEMENT": 0,
                "RENT_AND_UTILITIES": 7500,
                "ENTERTAINMENT": 0,
                "TRANSFER_IN": 0,
                "FOOD_AND_DRINK": 0,
                "LOAN_PAYMENTS": 0,
                "TRANSFER_OUT": 0,
                "GENERAL_MERCHANDISE": 0,
                "MEDICAL": 0,
                "TRANSPORTATION": 0,
                "GENERAL_SERVICES": 0,
                "PERSONAL_CARE": 0,
                "TRAVEL": 0,
                "GOVERNMENT_AND_NON_PROFIT": 0,
                "OTHER": 28900
            },
            totals: {
                income: 41200,
                expenses: 28900,
                netProfit: 12300
            }
        },
        {
            year: 2024,
            month: 5, // May
            categories: {
                "INCOME": 37400,
                "BANK_FEES": 0,
                "HOME_IMPROVEMENT": 0,
                "RENT_AND_UTILITIES": 7500,
                "ENTERTAINMENT": 0,
                "TRANSFER_IN": 0,
                "FOOD_AND_DRINK": 0,
                "LOAN_PAYMENTS": 0,
                "TRANSFER_OUT": 0,
                "GENERAL_MERCHANDISE": 0,
                "MEDICAL": 0,
                "TRANSPORTATION": 0,
                "GENERAL_SERVICES": 0,
                "PERSONAL_CARE": 0,
                "TRAVEL": 0,
                "GOVERNMENT_AND_NON_PROFIT": 0,
                "OTHER": 13000
            },
            totals: {
                income: 37400,
                expenses: 13000,
                netProfit: 24400
            }
        },
        {
            year: 2024,
            month: 6, // June
            categories: {
                "INCOME": 31100,
                "BANK_FEES": 0,
                "HOME_IMPROVEMENT": 0,
                "RENT_AND_UTILITIES": 7500,
                "ENTERTAINMENT": 0,
                "TRANSFER_IN": 0,
                "FOOD_AND_DRINK": 0,
                "LOAN_PAYMENTS": 0,
                "TRANSFER_OUT": 0,
                "GENERAL_MERCHANDISE": 0,
                "MEDICAL": 0,
                "TRANSPORTATION": 0,
                "GENERAL_SERVICES": 0,
                "PERSONAL_CARE": 0,
                "TRAVEL": 0,
                "GOVERNMENT_AND_NON_PROFIT": 0,
                "OTHER": 20000
            },
            totals: {
                income: 31100,
                expenses: 20000,
                netProfit: 11100
            }
        }
    ];

    return <FinancialTable data={sampleData} />;
};

export default FinancialTableWithData;