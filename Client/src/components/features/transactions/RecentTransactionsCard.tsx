import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {ArrowLink} from "@/components/shared/ArrowLink.tsx";
import {transactionsAtom} from "@/lib/atoms.ts";
import {useAtom} from "jotai";
import {currencyParser} from "@/lib/utils.ts";

export function RecentTransactionsCard() {
    const [{data}] = useAtom(transactionsAtom);
    const transactions = data?.slice(0, 11) ?? [];

    const dateParser = new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
    })
    
    const timeParser = new Intl.DateTimeFormat('en-GB', {
        timeStyle: 'short',
        hour12: true
    })
    
    return (
        <Card className="col-span-full md:col-span-5 row-span-2 backdrop-blur-sm">
            <CardHeader className="flex items-center justify-between flex-row p-4  rounded-t-[inherit] ">
                <CardTitle className="text-xl">Recent Transactions</CardTitle>
                <ArrowLink to="/transactions"></ArrowLink>
            </CardHeader>
            <CardContent>
                <ul>
                    {transactions.map((transaction) => (
                        <li 
                            key={transaction.id + "::RecentTransactionsCard"}
                            className="mb-2 flex gap-2 items-center text-sm"
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
                                <p className="text-neutral-400/90">{dateParser.format(new Date(transaction.datetime ?? transaction.date))}</p>
                            </div>
                            <div className="ml-auto text-end max-w-[30%]">
                                <p className="">{currencyParser.format(transaction.amount)}</p>
                                <p className="text-neutral-400/90 text-nowrap">{timeParser.format(new Date(transaction.datetime ?? transaction.date))}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}