import {Account} from "@/types.ts";
import {cn, currencyParser} from "@/lib/utils.ts";
import { TooltipProps } from "recharts";

type AccountsTooltipProps = {
    className?: string,
    showNegatives?: boolean,
    showLimits?: boolean,
}

export function AccountsTooltip({className, active, payload, showNegatives = true, showLimits = false}: TooltipProps<number, string> & AccountsTooltipProps) {
    if (active) {
        const item = payload?.[0].payload as Account & { fill: string };
        return (
            <div className={cn("bg-neutral-600/40 rounded-md backdrop-blur-sm flex gap-2 items-center", className)}>
                <div className="backdrop-blur-sm p-2 rounded-[inherit]">
                    <div
                        className="backdrop-blur-sm ps-2 bg-transparent border-l-4"
                        style={{
                            borderColor: item.fill,
                        }}
                    >
                        <p className="font-semibold">{item.name ?? ""}</p>
                        <p className="">
                            {showNegatives && item.type === "Credit" && "-"}{`${currencyParser.format(item.currentBalance ?? 0)}`}
                        </p>
                        {showLimits && <p>
                            <span className="text-secondary">Available:</span> {currencyParser.format(item.availableBalance ?? 0)}
                        </p>}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}