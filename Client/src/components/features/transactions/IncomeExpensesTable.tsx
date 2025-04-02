import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currencyParser, TransactionCategory, categories } from '@/lib/utils';
import { MonthlyBreakdown } from '@/types';

// Define types for the processed data structure
type CategoryData = {
  name: string;
  accessor: TransactionCategory;
  values: string[];
}

type ProcessedData = {
  months: string[];
  tableData: {
    income: {
      total: string[];
      categories: CategoryData[];
    };
    expense: {
      total: string[];
      categories: CategoryData[];
    };
    netProfit: string[];
  };
}

type ExpandedState = {
  income: boolean;
  expense: boolean;
}

type FinancialOverviewProps = {
  data: MonthlyBreakdown[];
}

const FinancialOverview = ({ data }: FinancialOverviewProps) => {
  const [expanded, setExpanded] = useState<ExpandedState>({
    income: true,
    expense: false
  });

  // Process raw data into the format needed for the table
  const processedData = useMemo<ProcessedData>(() => {
    // Extract months from the data
    const months = data
      .sort((a, b) => {
        // Sort by year and month (descending)
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      })
      .map(entry => `${getMonthName(entry.month)} ${entry.year}`);

    // Create income categories
    const incomeCategories: { name: string; accessor: TransactionCategory }[] = [
      { name: 'Income', accessor: 'INCOME' },
      { name: 'Transfer In', accessor: 'TRANSFER_IN' }
    ];

    // Create expense categories (all categories except income and transfer_in)
    const expenseCategories = categories
      .filter(category => category !== 'INCOME' && category !== 'TRANSFER_IN')
      .map(category => ({
        name: category.replace(/_/g, ' '),
        accessor: category
      }));

    // Build the table data structure
    const tableData = {
      income: {
        total: [] as string[],
        categories: incomeCategories.map(category => ({
          name: category.name,
          accessor: category.accessor,
          values: [] as string[]
        }))
      },
      expense: {
        total: [] as string[],
        categories: expenseCategories.map(category => ({
          name: category.name,
          accessor: category.accessor,
          values: [] as string[]
        }))
      },
      netProfit: [] as string[]
    };

    // Fill in values from data
    data.forEach(monthData => {
      // Calculate total income
      const totalIncome = monthData.income.reduce((sum, item) => sum + item.total, 0);
      tableData.income.total.push(formatCurrency(totalIncome));

      // Fill income categories
      incomeCategories.forEach(category => {
        const incomeItem = monthData.income.find(item => item.category === category.accessor);
        const value = incomeItem ? incomeItem.total : 0;
        const categoryObj = tableData.income.categories.find(cat => cat.name === category.name);
        if (categoryObj) {
          categoryObj.values.push(formatCurrency(value));
        }
      });

      // Calculate total expenses
      const totalExpenses = monthData.expenditure.reduce((sum, item) => sum + item.total, 0);
      tableData.expense.total.push(formatCurrency(totalExpenses));

      // Fill expense categories
      tableData.expense.categories.forEach(category => {
        
        // console.log('monthData', monthData.expenditure);
        const expenseItem = monthData.expenditure.find(item => item.category === category.accessor);
        console.log('expenseItem', expenseItem);
        const value = expenseItem ? expenseItem.total : 0;
        category.values.push(formatCurrency(value));
      });

      // Net profit
      tableData.netProfit.push(formatCurrency(monthData.netProfit));
    });

    return {
      months,
      tableData
    };
  }, [data]);

  // Define columns for the table
  const columns = useMemo(() => {
    return [
      {
        header: 'Category',
        accessorKey: 'category',
        cell: (info: any) => info.getValue()
      },
      ...processedData.months.map((month, index) => ({
        header: month,
        accessorKey: `month${index}`,
        cell: (info: any) => info.getValue()
      }))
    ];
  }, [processedData.months]);

  // Create rows for the table
  const rows = useMemo(() => {
    const allRows = [];

    // Income header row
    allRows.push({
      category: (
        <div 
          className="flex items-center font-semibold cursor-pointer" 
          onClick={() => setExpanded(prev => ({ ...prev, income: !prev.income }))}
        >
          Income {expanded.income ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </div>
      ),
      ...processedData.months.reduce((acc, _, index) => {
        acc[`month${index}`] = <span className="font-semibold">{processedData.tableData.income.total[index]}</span>;
        return acc;
      }, {} as Record<string, React.ReactNode>)
    });

    // Income category rows (shown when expanded)
    if (expanded.income) {
      processedData.tableData.income.categories.forEach(category => {
        allRows.push({
          category: (
            <div className="pl-6 flex items-center text-muted-foreground">
              <span className="mr-2">{category.name}</span>
            </div>
          ),
          ...processedData.months.reduce((acc, _, index) => {
            acc[`month${index}`] = category.values[index] || formatCurrency(0);
            return acc;
          }, {} as Record<string, string>)
        });
      });
    }

    // Expense header row
    allRows.push({
      category: (
        <div 
          className="flex items-center font-semibold cursor-pointer"
          onClick={() => setExpanded(prev => ({ ...prev, expense: !prev.expense }))}
        >
          Expense {expanded.expense ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </div>
      ),
      ...processedData.months.reduce((acc, _, index) => {
        acc[`month${index}`] = <span className="font-semibold">{processedData.tableData.expense.total[index]}</span>;
        return acc;
      }, {} as Record<string, React.ReactNode>)
    });

    // Expense category rows (shown when expanded)
    if (expanded.expense) {
      processedData.tableData.expense.categories.forEach(category => {
        allRows.push({
          category: (
            <div className="pl-6 flex items-center text-muted-foreground">
              <span className="mr-2">{category.name}</span>
            </div>
          ),
          ...processedData.months.reduce((acc, _, index) => {
            acc[`month${index}`] = category.values[index] || formatCurrency(0);
            return acc;
          }, {} as Record<string, string>)
        });
      });
    }

    // Net profit row
    allRows.push({
      category: <div className="font-semibold">Net profit</div>,
      ...processedData.months.reduce((acc, _, index) => {
        acc[`month${index}`] = <span className="font-semibold">{processedData.tableData.netProfit[index]}</span>;
        return acc;
      }, {} as Record<string, React.ReactNode>)
    });

    return allRows;
  }, [processedData, expanded]);

  // Initialize TanStack Table
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Helper functions
function getMonthName(monthNumber: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNumber - 1];
}

function formatCurrency(amount: number): string {
  return currencyParser.format(amount);
}

export default FinancialOverview;