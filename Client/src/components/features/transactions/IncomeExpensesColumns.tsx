import { MonthlyBreakdown } from '@/types';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from '@tanstack/react-table';

const columnHelper = createColumnHelper<MonthlyBreakdown>();

export const incomeExpensesColumns = [
    columnHelper.accessor("year", {
        header: ({ column }) => (
            <div className="flex items-center">
                <span className="capitalize">{column.id}</span>
            </div>
        ),
        cell: ({ row }) => {
            const year = row.original.year;
            return <span>{year}</span>;
        },
    }),
    columnHelper.accessor("month", {
        header: ({ column }) => (
            <div className="flex items-center">
                <span className="capitalize">{column.id}</span>
            </div>
        ),
        cell: ({ row }) => {
            const month = row.original.month;
            return <span>{month}</span>;
        },
    }),
    columnHelper.accessor("netProfit", {
        header: ({ column }) => (
            <div className="flex items-center">
                <span className="capitalize">{column.id}</span>
            </div>
        ),
        cell: ({ row }) => {
            const netProfit = row.original.netProfit;
            return <span>{netProfit}</span>;
        },
    }),
];