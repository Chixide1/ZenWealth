import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {addSpaceBetweenCapitals, cn, currencyParser} from "@/lib/utils.ts";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion.tsx";
import type {Account} from "@/types.ts";
import { Wallet } from "lucide-react";
import { useAtom } from "jotai";
import {AccountsAccordionAtom} from "@/lib/atoms.ts";

type AccountDetailsCardProps = {
    accountTypes: [string, Account[]][]
    className?: string
}

export function AccountsAccordion({ accountTypes, className }: AccountDetailsCardProps) {
    const [items, setItems] = useAtom(AccountsAccordionAtom);
    
    return (
        <Card className={cn("bg-offblack border-neutral-800", className)}>
            <CardHeader>
                <CardTitle>Your Accounts</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" value={items} onValueChange={setItems}>
                    {accountTypes.map((account) => {
                        // Calculate the total balance for the current account type
                        const totalBalance = account[1].reduce((sum, a) => sum + a.currentBalance, 0);

                        return (
                            <AccordionItem key={account[0]} value={account[0]} className="border-charcoal">
                                <AccordionTrigger className="text-lg">
                                    <span className="">{account[0]}</span>
                                    <span className="ml-auto mr-2 font-normal">
                                        {currencyParser.format(
                                            account[0] === "Credit" || account[0] === "Loan" ? -totalBalance : totalBalance,
                                        )}
                                    </span>{" "}
                                    {/* Display the total balance */}
                                </AccordionTrigger>
                                <AccordionContent className="divide-y divide-dashed">
                                    {account[1].map((a) => (
                                        <div
                                            key={`${a.id}::AccountDetailsCardAccordion`}
                                            id={`${a.id}::AccountDetailsCardAccordion`}
                                            className="flex items-center gap-2 border-charcoal rounded-sm p-2 first:border-t transition-colors duration-300"
                                        >
                                            <div className="bg-charcoal w-fit h-auto rounded-full p-2">
                                                <Wallet className="h-auto w-5" />
                                            </div>
                                            <div className="">
                                                <p>{a.name}</p>
                                                <p className="text-neutral-400">{addSpaceBetweenCapitals(a.subtype)}</p>
                                            </div>
                                            <div className="ml-auto text-end">
                                                <p>
                                                    {currencyParser.format(
                                                        a.type === "Credit" || a.type === "Loan" ? -a.currentBalance : a.currentBalance,
                                                    )}
                                                </p>
                                                <p className="text-neutral-400">**** **** **** {a.mask}</p>
                                            </div>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
}