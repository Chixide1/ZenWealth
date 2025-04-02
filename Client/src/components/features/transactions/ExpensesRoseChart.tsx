import { useState, useEffect, useRef } from "react";
import { Surface, Sector, PolarGrid } from "recharts";
import { cn, currencyParser, debitColors } from "@/lib/utils.ts";
import { CategoryTotal } from "@/types.ts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {DateFilterButton} from "@/components/features/transactions/DateFilterButton.tsx";
import { useAtom } from "jotai";
import { categoryTotalsParamsAtom} from "@/lib/atoms.ts";
import { DateRange } from "react-day-picker";

type ExpensesCoxcombChartProps = {
    data: CategoryTotal[],
    className?: string;
}

function ExpensesRose({ data }: { data: CategoryTotal[] }) {
    // State for tracking active tooltip
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Animation state
    const [animationProgress, setAnimationProgress] = useState(0);
    const [animationKey, setAnimationKey] = useState(0);

    // Fixed dimensions
    const fixedDimensions = { width: 400, height: 400 };
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate total spending
    const totalSpending = data.reduce((sum, expense) => sum + expense.total, 0);

    // Chart configuration
    const centerX = (fixedDimensions.width / 2);
    const centerY = (fixedDimensions.height / 2) - 25;
    const maxRadius = Math.min(fixedDimensions.width, fixedDimensions.height) * 0.4; // 40% of the smaller dimension
    const startAngleMargin = 1;
    const endAngleMargin = 1;

    // Define color palette to match the image
    const colorPalette = [
        "#4169E1", // Royal Blue
        "#1E3A8A", // Dark Blue
        "#06B6D4", // Light Cyan
        "#14B8A6", // Teal
        "#EC4899", // Pink
        "#D1D5DB"  // Light Gray
    ];

    // Calculate angle for each segment based on number of categories
    const angle = 360 / data.length;

    // Create circular grid guides
    const polarRadius = [maxRadius * 0.25, maxRadius * 0.5, maxRadius * 0.75, maxRadius];
    const polarAngles = [0, 45, 90, 135, 180, 225, 270, 315];

    // Scale for radius calculation
    const minRadius = maxRadius * 0.25; // Set minimum radius to 25% of max
    const getRadius = (total: number) => {
        if (data.length === 0) return minRadius;

        const minTotal = Math.min(...data.map(t => t.total));
        const maxTotal = Math.max(...data.map(t => t.total));

        // Handle edge case when all values are the same
        if (minTotal === maxTotal) return maxRadius * 0.75 * animationProgress;

        const scaledRadius = ((Math.log(total) - Math.log(minTotal)) / (Math.log(maxTotal) - Math.log(minTotal))) * maxRadius * animationProgress;
        return Math.max(scaledRadius, minRadius);
    };



    // Function to trigger animation
    const triggerAnimation = () => {
        setAnimationProgress(0);
        setAnimationKey(prev => prev + 1);
    };

    // Effect to trigger animation when data changes
    useEffect(() => {
        triggerAnimation();
    }, [data]);

    // Animation effect
    useEffect(() => {
        const animationDuration = 500; // half second
        const frameDuration = 20;
        const totalFrames = animationDuration / frameDuration;
        let frame = 0;

        const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            setAnimationProgress(progress < 1 ? progress : 1);

            if (progress >= 1) {
                clearInterval(timer);
            }
        }, frameDuration);

        return () => clearInterval(timer);
    }, [animationKey]);

    // Use a simple window resize listener since we don't need the observer
    useEffect(() => {
        const handleResize = () => {
            // Trigger animation on window resize
            triggerAnimation();
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Calculate tooltip X position
    const calculateTooltipX = (index: number) => {
        // Get the middle angle of the segment
        const middleAngle = ((index * angle + (index + 1) * angle) / 2) * (Math.PI / 180);
        const radius = getRadius(data[index].total);

        // Calculate position with offset to place tooltip next to segment
        return centerX + Math.cos(middleAngle) * (radius / 2) - 60; // 60px offset for tooltip width
    };

    // Calculate tooltip Y position
    const calculateTooltipY = (index: number) => {
        // Get the middle angle of the segment
        const middleAngle = ((index * angle + (index + 1) * angle) / 2) * (Math.PI / 180);
        const radius = getRadius(data[index].total);

        // Calculate position with offset
        return centerY + Math.sin(middleAngle) * (radius / 2) - 40; // 40px offset for tooltip height
    };

    return (
        <div className="w-full h-auto max-h-[31rem] relative flex flex-col" ref={containerRef}>
            <Surface width={fixedDimensions.width} height={fixedDimensions.height} className="w-full h-full">
                {/* Circular grid lines */}
                <PolarGrid
                    cx={centerX}
                    cy={centerY}
                    innerRadius={10}
                    outerRadius={maxRadius}
                    width={fixedDimensions.width}
                    height={fixedDimensions.height}
                    polarAngles={polarAngles}
                    polarRadius={polarRadius}
                    gridType="circle"
                    stroke="white"
                    opacity={0.3}
                    strokeWidth={0.5}
                />

                {/* Expense segments with hover effects */}
                {data.map((expense, index) => {
                    const radius = getRadius(expense.total);
                    const isActive = activeIndex === index;

                    return (
                        <Sector
                            key={`sector-${index}-${animationKey}`}
                            fill={colorPalette[index % colorPalette.length]}
                            fillOpacity={isActive ? 1 : 0.9}
                            innerRadius={10}
                            outerRadius={isActive ? radius + 5 : radius}
                            cx={centerX}
                            cy={centerY}
                            cornerRadius={10}
                            startAngle={index * angle + startAngleMargin}
                            endAngle={(index + 1) * angle - endAngleMargin}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                            className="cursor-pointer transition-all duration-300"
                        />
                    );
                })}
            </Surface>

            {/* Labels at bottom */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center gap-0.5">
                <p className="text-sm text-neutral-400">Top Expenses Total</p>
                <p className="text-xl font-bold">{currencyParser.format(totalSpending)}</p>
            </div>

            {/* Custom tooltip */}
            {activeIndex !== null && animationProgress === 1 && (
                <div
                    className="absolute w-fit h-fit pointer-events-none bg-neutral-600/70 backdrop-blur-sm shadow-md rounded text-primary"
                    style={{
                        top: calculateTooltipY(activeIndex),
                        left: calculateTooltipX(activeIndex)
                    }}
                >
                    <div className="bg-transparent px-2 m-2 border-l-4 text-nowrap text-sm" style={{borderColor: colorPalette[activeIndex]}}>
                        <p className="font-bold">{data[activeIndex].category.replace(/_/g, " ")}</p>
                        <p className="">{currencyParser.format(data[activeIndex].total)}</p>
                        <p className="text-xs text-neutral-dimension">
                            {Math.round((data[activeIndex].total / totalSpending) * 100)}% of total
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function ExpensesTable({ data }: { data: CategoryTotal[] }) {
    const totalSpending = data.reduce((sum, expense) => sum + expense.total, 0);

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-neutral-600 *:font-light *:px-2 *:py-8 text-neutral-400">
                        <th className="text-left">Expense category</th>
                        <th className="text-right">%</th>
                        <th className="text-right">Amount spent</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((expense, index) => {
                        const percentage = Math.round((expense.total / totalSpending) * 100);

                        return (
                            <tr
                                key={`ExpensesTableRow-${index}`}
                                className="border-b last:border-b-0 border-neutral-600 text-sm hover:bg-neutral-800/30 *:px-2 *:py-6"
                            >
                                <td className="p-2 flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: debitColors[index % debitColors.length] }}
                                    />
                                    {expense.category.replace(/_/g, " ")}
                                </td>
                                <td className="text-right p-2">{percentage}%</td>
                                <td className="text-right p-2">{currencyParser.format(expense.total)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export function ExpensesRoseChart({ data, className }: ExpensesCoxcombChartProps) {
    const [date, setDate] = useAtom(categoryTotalsParamsAtom);
    const dataRef = useRef<CategoryTotal[]>(data);

    // Track when data actually changes to prevent unnecessary animations
    const [dataVersion, setDataVersion] = useState(0);

    // Track layout changes
    const [layoutVersion, setLayoutVersion] = useState(0);

    useEffect(() => {
        // Only update if the data has actually changed
        const hasChanged =
            dataRef.current.length !== data.length ||
            dataRef.current.some((item, i) =>
                data[i] === undefined ||
                item.category !== data[i].category ||
                item.total !== data[i].total
            );

        if (hasChanged) {
            dataRef.current = [...data];
            setDataVersion(prev => prev + 1);
        }
    }, [data]);

    // Listen for layout changes that might affect the chart
    useEffect(() => {
        // Function to handle layout changes
        const handleResize = () => {
            setLayoutVersion(prev => prev + 1);
        };

        window.addEventListener("resize", handleResize);

        // Clean up
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDate({
            beginDate: range?.from ?? null,
            endDate: range?.to ?? null,
        });
    };

    const initialDateRange = date.beginDate && date.endDate
        ? { from: date.beginDate, to: date.endDate }
        : undefined;

    return (
        <Card className={cn("bg-offblack w-full h-auto", className)}>
            <CardHeader className="pb-0 flex-row justify-between">
                <CardTitle className="">Top Expenses Rose</CardTitle>
                <DateFilterButton initialDateRange={initialDateRange} onDateRangeChange={handleDateRangeChange} className="!mt-0"/>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-2">
                <ExpensesRose
                    key={`expenses-rose-${dataVersion}-layout-${layoutVersion}`}
                    data={data}
                />
                <ExpensesTable data={data} />
            </CardContent>
        </Card>
    );
}

export default ExpensesRoseChart;