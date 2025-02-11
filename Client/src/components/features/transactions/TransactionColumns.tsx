import {ColumnDef, createColumnHelper } from "@tanstack/react-table";
import ColumnSortingButton from "@/components/features/transactions/ColumnSortingButton.tsx";
import { Transaction } from "@/types";
import {useAtom } from "jotai";
import {transactionsPaginationAtom, transactionsParamsAtom} from "@/lib/atoms.ts";

const columnHelper = createColumnHelper<Transaction>();

export const transactionColumns: ColumnDef<Transaction, never>[] = [
    columnHelper.accessor("name", {
        header: ({column}) => (
            <div className="flex items-center">
                <span className="capitalize">{column.id}</span>
            </div>
        ),
        cell: ({row}) => {
            const name = row.original.merchantName || row.original.name;
            const imageSize = 30;

            return (
                <div className="flex gap-2 items-center justify-start">
                        <img
                            src={row.original.logoUrl ??
                                row.original.personalFinanceCategoryIconUrl ??
                                "https://plaid-category-icons.plaid.com/PFC_OTHER.png"}
                            alt="an image of the transaction logo"
                            className="rounded min-w-6 h-auto ms-1"
                            width={imageSize}
                        />
                    <span>{name}</span>
                </div>
            );
        },
        enableHiding: false,
        size: 200,
    }),
    columnHelper.accessor(row => {
        if(!row.personalFinanceCategory){
            return "Unknown";
        }
        return row.personalFinanceCategory.replace(/_/g, " ");
    }, {
        id: "category",
        header: ({column}) => (
            <div className="flex items-center">
                <span className="capitalize">{column.id}</span>
            </div>
        ),
        cell: ({row}) => {
            const category: string = row.getValue("category");

            return (
                <div className="flex gap-2 items-center">
                    <img
                        src={row.original.personalFinanceCategoryIconUrl || "https://plaid-category-icons.plaid.com/PFC_OTHER.png"}
                        alt="an image of the transaction logo"
                        className="rounded min-w-6 h-auto ms-1 w-7"
                    />
                    {category}
                </div>
            );
        },
        filterFn: (row, columnId, filterValue: Record<string, boolean>) => {
            if(!filterValue){
                return true;
            }
            
            const colVal = row.getValue<string>(columnId);
            return filterValue[colVal.toLowerCase()];
        },
        size: 200,
    }),
    columnHelper.accessor("amount", {
        header: ({column}) => {
            const [params, setParams] = useAtom(transactionsParamsAtom);
            const [pagination, setPagination] = useAtom(transactionsPaginationAtom);
            
            return (
                <ColumnSortingButton
                    onClick={() => {
                        setParams(params.sort === "Amount-Asc" ? {...params, sort: "Amount-Desc"} : {...params, sort: "Amount-Asc"});
                        setPagination({...pagination, pageIndex: 0});
                    }}
                    name={column.id}
                />
            );
        },
        cell: ({row}) => {
            const amount = row.getValue<number>("amount");
            const formatted = new Intl.NumberFormat(["en-US", "en-GB"], {
                style: "currency",
                currency: row.original.isoCurrencyCode || row.original.unofficialCurrencyCode,
                currencyDisplay: "symbol",
            }).format(amount);

            return <div className="">{formatted}</div>;
        },
        filterFn: (row, columnId, filterValue: {min: number, max: number}) => {
            if(!filterValue){
                return true;
            }
            
            const colVal = row.getValue<number>(columnId);
            return colVal >= filterValue.min && colVal <= filterValue.max;
        },
    }),
    columnHelper.accessor("date", {
        sortingFn: "datetime",
        header: ({column}) => {
            const [params, setParams] = useAtom(transactionsParamsAtom);
            const [pagination, setPagination] = useAtom(transactionsPaginationAtom);
            
            return (
                <ColumnSortingButton
                    onClick={() => {
                        setParams(params.sort === "Date-Asc" ? {...params, sort: null} : {...params, sort: "Date-Asc"});
                        setPagination({...pagination, pageIndex: 0});
                    }}
                    name={column.id}
                />
            );
        },
        cell: ({row}) => {
            const dateTime = new Date(row.original.datetime || row.original.date);
            const formatted = new Intl.DateTimeFormat("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(dateTime);

            return <div className="">{formatted}</div>;
        },
        filterFn: (row, columnId, filterValue: {from: Date, to: Date}) => {
            if(!filterValue){
                return true;
            }
            
            const colVal = new Date(row.getValue<string>(columnId));
            return colVal >= filterValue.from && colVal <= filterValue.to;
        },
    }),
];

