import { useAtom } from "jotai";
import { AccountsAccordionAtom } from "@/lib/atoms";
import type { Account } from "@/types";

export function useAccountScroll() {
    const [items, setItems] = useAtom(AccountsAccordionAtom);

    const scrollToAccount = (data: Account) => {
        if (data && data.id) {
            // Create the account ID and scroll to it
            const accountId = `${data.id}::AccountDetailsCardAccordion`;

            if (!items.includes(data.type)) {
                setItems((prev) => [...prev, data.type]);
            }

            // Scroll to the account with a small delay to allow accordion to open
            setTimeout(() => {
                const accountElement = document.getElementById(accountId);
                accountElement?.scrollIntoView({ behavior: "smooth", block: "center" });
                // Add a temporary highlight class
                accountElement?.classList.add("bg-secondary/10");
                setTimeout(() => {
                    accountElement?.classList.remove("bg-secondary/10");
                }, 4000);
            }, 500);
        }
    };

    return { scrollToAccount };
}
