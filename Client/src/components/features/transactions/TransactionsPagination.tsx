import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useAtom } from "jotai";
import { transactionsAtom, transactionsPaginationAtom } from "@/lib/atoms.ts";
import { ChevronDown } from "lucide-react";

const pageSizeOptions = [10, 20, 30, 40, 50];

export function PageSizeButton() {
    const [pagination, setPagination] = useAtom(transactionsPaginationAtom);

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="accent" className="group gap-0.5 p-2 font-medium" size="sm">
                    {pagination.pageSize}
                    <ChevronDown className="h-4 w-4 transition-all duration-300 group-data-[state=open]:rotate-180" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-fit min-w-0 bg-accent">
                {pageSizeOptions.map((size) => (
                    <DropdownMenuItem
                        key={size}
                        onClick={() => setPagination({pageSize: size, pageIndex: 0})}
                        className={
                            "justify-center my-1 py-1 px-2.5 text-sm focus:bg-black/10 hover:bg-black/10" +
                            (pagination.pageSize === size && " bg-black/10")
                        }
                    >
                        {size}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function PrevButton() {
    const [pagination, setPagination] = useAtom(transactionsPaginationAtom);
    
    return (
        <Button
            className="me-2"
            variant="accent"
            size="sm"
            onClick={() =>
                setPagination((prev) => ({
                    ...prev,
                    pageIndex: pagination.pageIndex - 1,
                }))
            }
            disabled={pagination.pageIndex === 0}
        >
            Previous
        </Button>
    );
}

export function NextButton() {
    const [pagination, setPagination] = useAtom(transactionsPaginationAtom);
    const [{ fetchNextPage, hasNextPage, data }] = useAtom(transactionsAtom);

    return (
        <Button
            className=""
            variant="accent"
            size="sm"
            onClick={async () => {
                if (hasNextPage) {
                    await fetchNextPage();
                }

                setPagination((prev) => ({
                    ...prev,
                    pageIndex: pagination.pageIndex + 1,
                }));
            }}
            disabled={data && !hasNextPage && pagination.pageIndex === data.pages.length - 1}
        >
            Next
        </Button>
    );
}

