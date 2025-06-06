﻿import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {cn, currencyParser} from "@/lib/utils.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {TransactionData} from "@/types.ts";
import {NextButton, PageSizeButton, PrevButton} from "@/components/features/transactions/TransactionsPagination.tsx";
import {DateFilterButton} from "@/components/features/transactions/DateFilterButton.tsx";
import {ColumnFilterButton} from "@/components/features/transactions/ColumnFilterButton.tsx";
import { useAtom } from "jotai";
import {transactionsPaginationAtom, transactionsParamsAtom} from "@/lib/atoms.ts";
import {MobileSortingButton} from "@/components/features/transactions/MobileSortingButton.tsx";
import type { DateRange } from "react-day-picker";

type TransactionsCardProps = {
    className?: string,
    transactionsData: TransactionData | undefined
}

export function TransactionsCard({className, transactionsData,}: TransactionsCardProps) {
    const [{pageSize}] = useAtom(transactionsPaginationAtom);
    const [filters, setFilters] = useAtom(transactionsParamsAtom);

    const dateParser = new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
    });

    const timeParser = new Intl.DateTimeFormat("en-GB", {
        timeStyle: "short",
        hour12: true
    });

    const transactions = transactionsData?.transactions;

    // Handler for date range changes
    const handleDateRangeChange = (range: DateRange | undefined) => {
        setFilters(prev => ({
            ...prev,
            beginDate: range?.from ?? null,
            endDate: range?.to ?? null,
        }));
    };

    // Create an initial date range from the filters
    const initialDateRange = filters.beginDate && filters.endDate
        ? { from: filters.beginDate, to: filters.endDate }
        : undefined;

    return (
        <Card className={cn("", className)}>
            <CardHeader className="flex items-center justify-between flex-row p-3 rounded-t-[inherit]">
                <CardTitle className="text-xl text-nowrap">Transaction History</CardTitle>
                <div className="!mt-0 inline-flex items-center gap-2">
                    <ColumnFilterButton />
                    <DateFilterButton
                        initialDateRange={initialDateRange}
                        onDateRangeChange={handleDateRangeChange}
                    />
                    <MobileSortingButton />
                </div>
            </CardHeader>
            <CardContent className="p-3 border-t border-neutral-500/30">
                <ul className="flex flex-col gap-2">
                    {!transactions ? Array.from({ length: pageSize })
                        .map((_, i) => (
                            <li className="flex items-center space-x-4" key={i + "::TransactionsCardSkeleton"}>
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 w-10/12">
                                    <Skeleton className="h-4" />
                                    <Skeleton className="h-4" />
                                </div>
                            </li>
                        )) : transactions.length <= 0 ? (
                        <div className="w-full text-neutral-400 text-center">No Results</div>
                    ) : transactions.map((transaction) => (
                        <li
                            key={transaction.id + "::RecentTransactionsCard"}
                            className="flex gap-2 items-center text-sm"
                        >
                            <img
                                src={transaction.logoUrl ??
                                    transaction.categoryIconUrl ??
                                    "https://plaid-category-icons.plaid.com/PFC_OTHER.png"}
                                alt="an image of the transaction logo"
                                className="rounded min-w-6 h-auto"
                                width={30}
                            />
                            <div className="max-w-[50%]">
                                <p className="truncate">{transaction.name}</p>
                                <p className="text-neutral-400">{dateParser.format(new Date(transaction.datetime ?? transaction.date))}</p>
                            </div>
                            <div className="ml-auto text-end max-w-[30%]">
                                <p className="">{currencyParser.format(transaction.amount)}</p>
                                <p className="text-neutral-400 text-nowrap">{timeParser.format(new Date(transaction.datetime ?? transaction.date))}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-3 border-t border-neutral-500/30">
                <PageSizeButton />
                <div className="flex items-center">
                    <PrevButton />
                    <NextButton />
                </div>
            </CardFooter>
        </Card>
    );
}