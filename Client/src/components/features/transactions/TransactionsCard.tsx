import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {ArrowLink} from "@/components/shared/ArrowLink.tsx";
import {cn, currencyParser} from "@/lib/utils.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Transaction} from "@/types.ts";

type TransactionsCardProps = {
    className?: string,
    title: string,
    allFeatures?: boolean,
    transactions: Transaction[]
}

export function TransactionsCard({className, title, transactions, allFeatures = false}: TransactionsCardProps) {
    const dateParser = new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
    })
    
    const timeParser = new Intl.DateTimeFormat('en-GB', {
        timeStyle: 'short',
        hour12: true
    })
    
    return (
        <Card className={cn("", className)}>
            <CardHeader className="flex items-center justify-between flex-row px-3 md:px-4 pb-2 rounded-t-[inherit]">
                <CardTitle className="text-xl">{title}</CardTitle>
                {!allFeatures && <ArrowLink to="/transactions"></ArrowLink>}
            </CardHeader>
            <CardContent className="px-3">
                <Tabs defaultValue="all">
                    <TabsList className="bg-transparent gap-1 mb-1">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="income">Income</TabsTrigger>
                        <TabsTrigger value="expenses">Expenses</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                        <ul className="flex flex-col gap-2">
                            {transactions.length > 0 ? transactions.map((transaction) => (
                                <li
                                    key={transaction.id + "::TransactionsCard"}
                                    className="flex gap-2 items-center text-sm"
                                >
                                    <img
                                        src={transaction.logoUrl ??
                                            transaction.personalFinanceCategoryIconUrl ??
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
                            )) : Array.from({ length: 10 })
                                .map((_, i) => (
                                    <li className="flex items-center space-x-4" key={i + "::TransactionsCardSkeleton"}>
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="space-y-2 w-10/12">
                                            <Skeleton className="h-4" />
                                            <Skeleton className="h-4" />
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}