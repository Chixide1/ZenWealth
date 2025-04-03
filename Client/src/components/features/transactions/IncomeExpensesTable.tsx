import { Fragment } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { categories, cn, currencyParser } from "@/lib/utils";
import { FinancialPeriod } from "@/types";
import { format } from "date-fns";

type IncomeExpensesTableProps = {
    className?: string;
    data: FinancialPeriod[];
}

export function IncomeExpensesTable({ className, data }: IncomeExpensesTableProps) {
    
    const incomeCategories = categories.filter(category => 
        data.some(period => period.categories[category] < 0)
    );
    
    const expenseCategories = categories.filter(category => 
        data.some(period => period.categories[category] >= 0)
    );
    
    return (
        <div className={cn("text-white p-4 rounded-lg w-full overflow-auto", className)}>
            <Table>
                <TableHeader>
                    <TableRow className="border-neutral-700">
                        <TableHead className="text-neutral-300 rounded-lg">
                            <div className="bg-neutral-700/70 rounded-md p-3">Category</div>
                        </TableHead>
                        {data.map((period) => (
                            <TableHead key={`${period.year}-${period.month}`} className="text-right rounded-md text-neutral-300">
                                <div className="bg-neutral-700/70 rounded-md p-3 text-nowrap">{getMonthName(period.month)} {period.year}</div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* Income Section */}
                    <TableRow className="border-neutral-700">
                        <TableCell colSpan={data.length + 1} className="p-0">
                            <Accordion type="single" className="w-full border-b border-neutral-700" collapsible>
                                <AccordionItem value="income" className="border-0">
                                    <div className="grid grid-cols-[1fr_repeat(var(--data-length),1fr)] w-full items-center" 
                                        style={{ "--data-length": data.length } as React.CSSProperties}>
                                        <div className="py-2 px-4">
                                            <AccordionTrigger className="font-medium hover:no-underline">
                                                Income
                                            </AccordionTrigger>
                                        </div>
                                        {data.map((period) => (
                                            <div key={`${period.year}-${period.month}-income`} className="text-right py-4 px-2">
                                                {formatIncome(period.totals.income)}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <AccordionContent>
                                        <div className="grid grid-cols-[1fr_repeat(var(--data-length),1fr)] w-full" 
                                            style={{ "--data-length": data.length } as React.CSSProperties}>
                                            {incomeCategories.map((category) => (
                                                <Fragment key={category}>
                                                    <div title={category.replace(/_/g, " ")} className="text-ellipsis overflow-hidden md:pl-8 py-4 border-t border-neutral-800 text-neutral-400">
                                                        {category.replace(/_/g, " ")}
                                                    </div>
                                                    {data.map((period) => (
                                                        <div 
                                                            key={`${period.year}-${period.month}-${category}`} 
                                                            className="text-right p-4 pr-2 border-t border-neutral-800 text-neutral-400"
                                                        >
                                                            {formatIncome(period.categories[category])}
                                                        </div>
                                                    ))}
                                                </Fragment>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </TableCell>
                    </TableRow>

                    {/* Expenses Section */}
                    <TableRow className="border-neutral-700">
                        <TableCell colSpan={data.length + 1} className="p-0 border-neutral-700">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="expenses" className="border-neutral-700">
                                    <div className="grid grid-cols-[1fr_repeat(var(--data-length),1fr)] w-full items-center" 
                                        style={{ "--data-length": data.length } as React.CSSProperties}>
                                        <div className="py-2 px-4">
                                            <AccordionTrigger className="font-medium hover:no-underline">
                                                Expense
                                            </AccordionTrigger>
                                        </div>
                                        {data.map((period) => (
                                            <div key={`${period.year}-${period.month}-expenses`} className="text-right py-4 px-2">
                                                {formatExpense(period.totals.expenses)}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <AccordionContent>
                                        <div className="grid grid-cols-[1fr_repeat(var(--data-length),1fr)] w-full pb-0" 
                                            style={{ "--data-length": data.length } as React.CSSProperties}>
                                            {expenseCategories.length > 0 ? (
                                                expenseCategories.map((category) => (
                                                    <Fragment key={category}>
                                                        <div title={category.replace(/_/g, " ")} className="text-ellipsis overflow-hidden md:pl-8 py-4 border-t  border-neutral-800 text-neutral-400">
                                                            {category.replace(/_/g, " ")}
                                                        </div>
                                                        {data.map((period) => (
                                                            <div 
                                                                key={`${period.year}-${period.month}-${category}`} 
                                                                className="text-right p-4 pr-2 border-t border-neutral-800 text-neutral-400"
                                                            >
                                                                {formatExpense(period.categories[category])}
                                                            </div>
                                                        ))}
                                                    </Fragment>
                                                ))
                                            ) : (
                                                <div className="md:pl-8 py-4 border-b border-neutral-800 text-neutral-400 col-span-full">
                                                    No expense categories found
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </TableCell>
                    </TableRow>

                    {/* Net Profit row */}
                    <TableRow>
                        <TableCell className="font-medium py-6 px-4">Net profit</TableCell>
                        {data.map((period) => (
                            <TableCell key={`${period.year}-${period.month}-netProfit`} className="text-right text-nowrap">
                                {currencyParser.format(period.totals.netProfit)}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}


/** Helper Functions **/

// Get the Month Name
const getMonthName = (monthNum: number) => {
    const date = new Date().setMonth(monthNum - 1);
    return format(date, "MMM");
};

// Format category amounts that are expenses
const formatExpense = (amount: number | undefined) => {
    if(!amount || amount < 0 ){
        return currencyParser.format(0);
    }

    return currencyParser.format(amount);
};

// Format category amounts that are income
const formatIncome = (amount: number | undefined) => {
    if(!amount || amount > 0 ){
        return currencyParser.format(0);
    }

    return currencyParser.format(Math.abs(amount));
};