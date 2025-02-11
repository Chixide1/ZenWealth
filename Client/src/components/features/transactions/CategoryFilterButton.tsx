import {Button} from "@/components/ui/button.tsx";
import {Transaction} from "@/types";
import { Column } from "@tanstack/react-table";
import { Toggle } from "@/components/ui/toggle";
import ColumnFilterButton from "@/components/shared/ColumnFilterButton.tsx";

export default function CategoryFilterButton({column}: {column:  Column<Transaction, unknown>}){
    const curFilter = column.getFilterValue() as Record<string, boolean>;
    
    function isFiltered(category: string){
        return curFilter[category];
    }
    
    return (
        <ColumnFilterButton>
            <div className="text-primary flex items-center justify-between pb-4">
                <h4 className="font-medium leading-none">Filter by Category</h4>
                <Button
                    className="text-secondary text-xs"
                    size="sm"
                    variant="accent"
                    onClick={() => {
                        if (Object.values(curFilter).every(value => value)) {
                            const resetCategories = Object.fromEntries(Object.keys(curFilter)
                                .map((key) => [key, false]));
                            column.setFilterValue(resetCategories);
                        } else {
                            const resetCategories = Object.fromEntries(Object.keys(curFilter)
                                .map((key) => [key, true]));
                            column.setFilterValue(resetCategories);
                        }
                    }}
                >
                    Toggle All
                </Button>
            </div>
            <div className="flex justify-center flex-wrap gap-1">
                {Array.from<string, string>(column.getFacetedUniqueValues().keys(), (c) => c.toLowerCase())
                    .sort()
                    .map(category => (
                        <Toggle
                            className="capitalize data-[state=on]:hover:bg-secondary/20 backdrop-blur-sm data-[state=on]:backdrop-blur-sm data-[state=on]:bg-secondary/[0.3]
                            data-[state=on]:text-secondary data-[state=on]:text-xs text-xs bg-muted/[0.3] text-neutral-300 hover:bg-muted/[0.2] hover:text-neutral-300"
                            key={category + " Toggle"}
                            pressed={isFiltered(category)}
                            onPressedChange={(value) => {
                                column.setFilterValue({
                                    ...curFilter,
                                    [category]: value
                                });
                            }}
                        >
                            {category}
                        </Toggle>
                    ))}
            </div>
        </ColumnFilterButton>
    );
}