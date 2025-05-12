import { createColumnHelper } from "@tanstack/react-table";
import ColumnSortingButton from "@/components/features/transactions/ColumnSortingButton.tsx";
import { Transaction } from "@/types";
import {useAtom } from "jotai";
import {transactionsPaginationAtom, transactionsParamsAtom} from "@/lib/atoms.ts";
import { currencyParser } from "@/lib/utils";

const columnHelper = createColumnHelper<Transaction>();

export const transactionColumns = [ 
    columnHelper.accessor("name", {
        header: ({column}) => (
            <div className="flex items-center">
                <span className="capitalize">{column.id}</span>
            </div>
        ),
        cell: ({row}) => {
            const name = row.original.name;
            const imageSize = 30;

            return (
                <div className="flex gap-2 items-center justify-start">
                    <img
                        src={row.original.logoUrl ?? row.original.categoryIconUrl}
                        alt="an image of the transaction logo"
                        className="rounded min-w-6 h-auto ms-1"
                        width={imageSize}
                    />
                    <span title={name}>{name}</span>
                </div>
            );
        },
        enableHiding: false,
    }),
    columnHelper.accessor(row => row.category.replace(/_/g, " "), {
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
                        src={row.original.categoryIconUrl}
                        alt="an image of the transaction logo"
                        className="rounded min-w-6 h-auto ms-1 w-7"
                    />
                    {category}
                </div>
            );
        },
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
            const formatted = currencyParser.format(amount);

            return <div className="">{formatted}</div>;
        },
    }),
    columnHelper.accessor("date", {
        header: ({column}) => {
            const [params, setParams] = useAtom(transactionsParamsAtom);
            const [pagination, setPagination] = useAtom(transactionsPaginationAtom);
            
            return (
                <ColumnSortingButton
                    onClick={() => {
                        setParams(params.sort === "Date-Asc" ? {...params, sort: "Date-Desc"} : {...params, sort: "Date-Asc"});
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
        }
    }),
    columnHelper.accessor("accountName", {
        id: "account",
        header: ({column}) => {
            return (
                <div className="flex items-center">
                    <span className="capitalize">{column.id}</span>
                </div>
            );
        },
    }),
];

