import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { categories, cn, currencyParser, TransactionCategory } from '@/lib/utils';
import { FinancialPeriod } from '@/types';

type IncomeExpensesTableProps = {
    className?: string;
    data: FinancialPeriod[];
}

export function IncomeExpensesTable({ className, data }: IncomeExpensesTableProps) {
    const [isIncomeExpanded, setIsIncomeExpanded] = useState(true);
    const [isExpenseExpanded, setIsExpenseExpanded] = useState(true);

    // Format numbers as currency
    const formatCurrency = (amount: number) => {
        return currencyParser.format(amount)
    };

    // Separate categories into income and expense categories
    const incomeCategories = categories.filter(category => 
        data.some(period => period.categories[category] < 0)
    );
    
    const expenseCategories = categories.filter(category => 
        data.some(period => period.categories[category] >= 0)
    );

    return (
        <div className={cn(" text-white p-4 rounded-lg w-full", className)}>
            <Table>
                <TableHeader>
                    <TableRow className="border-neutral-700">
                        <TableHead className="text-neutral-300 rounded-lg">
                            <div className="bg-neutral-700/50  rounded-md p-3">Category</div>
                        </TableHead>
                        {data.map((period) => (
                            <TableHead key={`${period.year}-${period.month}`} className="text-right rounded-md text-neutral-300">
                                <div className="bg-neutral-700/50 rounded-md p-3">{getMonthName(period.month)} {period.year}</div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* Income section */}
                    <TableRow className="border-b border-neutral-700 cursor-pointer" onClick={() => setIsIncomeExpanded(!isIncomeExpanded)}>
                        <TableCell className="font-medium flex items-center gap-2">
                            Income
                            {<ChevronDown size={16} className={`text-secondary transition-transform duration-300 ${isIncomeExpanded && "rotate-180"}`} />}
                        </TableCell>
                        {data.map((period) => (
                            <TableCell key={`${period.year}-${period.month}-income`} className="text-right">
                                {formatCurrency(Math.abs(period.totals.income))}
                            </TableCell>
                        ))}
                    </TableRow>

                    {/* Income categories */}
                    {isIncomeExpanded && incomeCategories.map((category) => (
                        <TableRow key={category} className="border-b border-neutral-800 text-neutral-400">
                            <TableCell className="pl-8">
                                {category.replace(/_/g, " ")}
                            </TableCell>
                            {data.map((period) => (
                                <TableCell key={`${period.year}-${period.month}-${category}`} className="text-right">
                                    {formatCurrency(Math.abs(period.categories[category] || 0))}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}

                    {/* Expenses row */}
                    <TableRow className="border-b border-neutral-700 cursor-pointer" onClick={() => setIsExpenseExpanded(!isExpenseExpanded)}>
                        <TableCell className="font-medium flex items-center gap-2">
                            Expense
                            {<ChevronDown size={16} className={`text-secondary transition-transform duration-300 ${isExpenseExpanded && "rotate-180"}`} />}
                        </TableCell>
                        {data.map((period) => (
                            <TableCell key={`${period.year}-${period.month}-expenses`} className="text-right">
                                {formatCurrency(period.totals.expenses)}
                            </TableCell>
                        ))}
                    </TableRow>

                    {/* Expense categories */}
                    {isExpenseExpanded && expenseCategories.length > 0 ? (
                        expenseCategories.map((category) => (
                            <TableRow key={category} className="border-b border-neutral-800 text-neutral-400">
                                <TableCell className="pl-8">
                                    {category.replace(/_/g, " ")}
                                </TableCell>
                                {data.map((period) => (
                                    <TableCell key={`${period.year}-${period.month}-${category}`} className="text-right">
                                        {formatCurrency(period.categories[category] || 0)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : isExpenseExpanded && (
                        <TableRow className="border-b border-neutral-800 text-neutral-400">
                            <TableCell className="pl-8" colSpan={data.length + 1}>
                                No expense categories found
                            </TableCell>
                        </TableRow>
                    )}

                    {/* Net Profit row */}
                    <TableRow>
                        <TableCell className="font-medium">Net profit</TableCell>
                        {data.map((period) => (
                            <TableCell key={`${period.year}-${period.month}-netProfit`} className="text-right">
                                {formatCurrency(period.totals.netProfit)}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}

// Helper function to get month name
const getMonthName = (monthNum: number) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[monthNum - 1];
};