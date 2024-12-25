import {Button} from "@/components/core/button.tsx";
import {Transaction} from "@/types";
import { Column } from "@tanstack/react-table";
import { Toggle } from "@/components/core/toggle";
import FilterButton from "@/components/shared/FilterButton.tsx";

export default function CategoryFilterButton({column}: {column:  Column<Transaction, unknown>}){
    const curFilter = column.getFilterValue() as Record<string, boolean>;
    
    function isFiltered(category: string){
        return curFilter[category]
    }
    
    return (
        <FilterButton column={column}>
            <div className="text-primary flex items-center justify-between pb-4">
                <h4 className="font-medium leading-none">Filter by Category</h4>
                <Button
                    className="text-secondary text-xs"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                        if (Object.values(curFilter).every(value => value)) {
                            const resetCategories = Object.fromEntries(Object.keys(curFilter)
                                .map((key) => [key, false]))
                            column.setFilterValue(resetCategories)
                        } else {
                            const resetCategories = Object.fromEntries(Object.keys(curFilter)
                                .map((key) => [key, true]))
                            column.setFilterValue(resetCategories)
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
                            className="capitalize data-[state=on]:hover:bg-secondary/[0.2] backdrop-blur-sm data-[state=on]:backdrop-blur-sm data-[state=on]:bg-secondary/[0.3]
                            data-[state=on]:text-secondary data-[state=on]:text-xs text-xs bg-muted/[0.3] text-neutral-300 hover:bg-muted/[0.2] hover:text-neutral-300"
                            key={category + " Toggle"}
                            pressed={isFiltered(category)}
                            onPressedChange={() => {
                                const updated = curFilter
                                updated[category] = !updated[category];
                                column.setFilterValue(updated)
                            }}
                        >
                            {category}
                        </Toggle>
                    ))}
            </div>
        </FilterButton>
    )
}