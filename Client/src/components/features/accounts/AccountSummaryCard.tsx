import {cn} from "@/lib/utils.ts";

type AccountSummaryCardProps = {
    children?: React.ReactNode,
    className?: string
}

export function AccountSummaryCard({children, className}: AccountSummaryCardProps) {
    
    return (
        <div className={cn("bg-primary/10 col-span-4 p-4 rounded-2xl border border-neutral-700", className)}>
            {children}
        </div>
    )
}