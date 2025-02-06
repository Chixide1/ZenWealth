import {Account} from "@/types.ts";
import {cn, currencyParser} from "@/lib/utils.ts";
import { TooltipProps } from "recharts";

export function CustomTooltip({className, active, payload}: TooltipProps<number, string> & {className?: string}) {
    if (active) {
        const item = payload?.[0].payload as Account & { fill: string }
        return (
            <div className={cn("bg-neutral-600/40 rounded-md backdrop-blur-sm flex gap-2 items-center h-12 max-h-20", className)}>
                <div className="backdrop-blur-sm gap-2 h-full flex items-center p-2">
                    <div className="w-1 h-full rounded-full" style={{backgroundColor: item.fill}}></div>
                    <div className="backdrop-blur-sm bg-transparent">
                        <p className="font-semibold">{payload?.[0].name}</p>
                        <p className="">
                            {item.type === "Credit" && "-"}{`${currencyParser.format(payload?.[0].value || 0)}`}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}