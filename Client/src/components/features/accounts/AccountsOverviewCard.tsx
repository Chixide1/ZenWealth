﻿import { useState, useEffect } from "react";
import type { Account } from "@/types";
import { currencyParser } from "@/lib/utils.ts";

type AccountsOverviewCardProps = {
    accounts: Account[]
    title: string
}

export function AccountsOverviewCard({ accounts, title }: AccountsOverviewCardProps) {
    const [mounted, setMounted] = useState(false);
    const [hoveredAccountId, setHoveredAccountId] = useState<number | null>(null);

    const total = accounts.reduce((sum, account) => sum + account.currentBalance, 0);

    // Trigger animation after component mounts
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="py-6 text-primary border-t border-background">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-medium">{title}</h2>
                <span className="">{currencyParser.format(title === "Credit" || title === "Loan" ? -total : total)}</span>
            </div>

            {/* Stacked bar chart using divs */}
            <div className="w-full flex gap-0.5 overflow-hidden mb-4">
                {accounts.map((account, index) => {
                    const percentage = (account.currentBalance / total) * 100;
                    return (
                        <div
                            className="rounded-sm transition-all duration-1000 ease-out"
                            key={account.id + "::AccountsOverviewCardBar"}
                            style={{
                                width: mounted ? `${percentage}%` : "0%",
                                backgroundColor: account.fill,
                                height: "20px",
                                transitionDelay: `${index * 150}ms`, // Add staggered delay based on index
                                opacity: hoveredAccountId ? (hoveredAccountId === account.id ? 1 : 0.4) : 1,
                                transition: "opacity 0.3s ease, width 1000ms ease-out",
                            }}
                        />
                    );
                })}
            </div>

            {/* Legend */}
            <div className="space-y-4 mt-3">
                {accounts.map((account) => {
                    const percentage = (account.currentBalance / total) * 100;
                    return (
                        <div
                            key={account.id + "::AccountsOverviewCardLegend"}
                            className="flex justify-between items-center"
                            onMouseEnter={() => setHoveredAccountId(account.id)}
                            onMouseLeave={() => setHoveredAccountId(null)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: account.fill }} />
                                <span className="text-sm text-gray-300">{account.name}</span>
                            </div>
                            <span className="text-sm text-gray-300">{percentage.toFixed(2)}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

