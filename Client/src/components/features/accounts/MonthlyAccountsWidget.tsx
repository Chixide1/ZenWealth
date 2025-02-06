import {Card, CardContent, CardFooter, CardTitle} from "@/components/ui/card.tsx";
import {cn, currencyParser} from "@/lib/utils.ts";
import { Wallet } from "lucide-react";

type MonthlyAccountsWidgetProps = {
    className?: string,
    title: string,
    amount: number,
}

export function MonthlyAccountsWidget({className, title, amount}: MonthlyAccountsWidgetProps) {
    return (
        <Card className={cn("bg-[hsl(0,0%,10%)] min-w-60 md:min-w-36 md:w-full p-5 rounded-2xl border border-neutral-800", className)}>
            <div className="bg-primary/[0.125] p-2 rounded-full float-right">
                <Wallet className="w-4 h-auto" />
            </div>
            <CardContent className="p-0">
                <CardTitle className="text-neutral-400 text-xs font-semibold w-1/2">{title}</CardTitle>
                <p className=" mt-1 text-lg">{currencyParser.format(amount)}</p>
            </CardContent>
            <CardFooter className="p-0 mt-6 flex items-center">
                {/*<div className="mr-auto w-full h-4 bg-primary/[0.125] rounded-full overflow-hidden">*/}
                {/*    <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)_100%)] bg-[length:8px_8px]" />*/}
                {/*</div>*/}
                <svg className="h-4 w-full">
                    <defs>
                        <pattern id="diagonalStripes" patternUnits="userSpaceOnUse" width="8" height="8">
                            <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" strokeWidth="1" className="stroke-secondary"/>
                        </pattern>
                    </defs>
                    <rect className="h-4 w-full" fill={"url(#diagonalStripes)"} />
                </svg>
            </CardFooter>
        </Card>
    )
}