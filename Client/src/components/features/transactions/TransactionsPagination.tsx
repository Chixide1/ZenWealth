import { Button } from "@/components/ui/button.tsx";
import { useAtom } from "jotai";
import { transactionsAtom, transactionsPaginationAtom } from "@/lib/atoms.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

const pageSizeOptions = [10, 20, 30, 40, 50];

export function PageSizeButton() {
    const [{pageSize}, setPagination] = useAtom(transactionsPaginationAtom);

    return (
        <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPagination({pageSize: Number(value), pageIndex: 0})}
        >
            <SelectTrigger className="bg-accent text-black text-xs px-2 w-fit">
                <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-fit min-w-0 bg-accent text-black">
                {pageSizeOptions.map((size) => (
                    <SelectItem
                        hideCheck={true}
                        value={size.toString()}
                        key={size + "::PageSizeButton"}
                        className={
                            "justify-center my-1 py-1 px-2.5 text-sm focus:bg-black/10 hover:bg-black/10" +
                            (pageSize === size && " bg-black/10")
                        }
                    >
                        {size}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
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

