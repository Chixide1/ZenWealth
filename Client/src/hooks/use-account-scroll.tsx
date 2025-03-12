import {AccountsAccordionAtom} from "@/lib/atoms.ts";
import {useAtom} from "jotai";

export function UseAccountScroll() {
    const [items, setItems] = useAtom(AccountsAccordionAtom);
    
    
}