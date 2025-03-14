import { useState, useEffect } from "react";
import { Surface, Sector, PolarGrid } from "recharts";
import {cn, currencyParser} from "@/lib/utils.ts";
import {CategoryTotal} from "@/types.ts";

type ExpensesRoseChartProps = {
    data: CategoryTotal[],
    className?: string;
}

export function ExpensesRoseChart({ data, className }: ExpensesRoseChartProps) {
    // State for tracking active tooltip
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Animation state
    const [animationProgress, setAnimationProgress] = useState(0);

    // Calculate total spending
    const totalSpending = data.reduce((sum, expense) => sum + expense.total, 0);

    // Chart configuration
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 160;
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
    const polarRadius = [40, 80, 120, 160];
    const polarAngles = [0, 45, 90, 135, 180, 225, 270, 315];

    // Scale for radius calculation
    const minRadius = 40; // Set a reasonable minimum radius
    const getRadius = (total: number) => {
        const minTotal = Math.min(...data.map(t => t.total));
        const maxTotal = Math.max(...data.map(t => t.total));
        const scaledRadius = ((Math.log(total) - Math.log(minTotal)) / (Math.log(maxTotal) - Math.log(minTotal))) * maxRadius * animationProgress;
        return Math.max(scaledRadius, minRadius);
    };

    // Tooltip event handlers
    const handleMouseEnter = (_: { category: string, total: number }, index: number) => {
        setActiveIndex(index);
    };

    const handleMouseLeave = () => {
        setActiveIndex(null);
    };

    // Calculate tooltip position
    const getTooltipPosition = (index: number) => {
        const expense = data[index];
        const radius = getRadius(expense.total);

        // Calculate the middle angle of the sector in radians
        const middleAngle = ((index * angle + (index + 1) * angle) / 2 - 90) * (Math.PI / 180);

        // Position the tooltip slightly outside the sector
        const tooltipRadius = radius + 20;
        const x = centerX + tooltipRadius * Math.cos(middleAngle);
        const y = centerY + tooltipRadius * Math.sin(middleAngle);

        return { x, y };
    };

    // Animation effect
    useEffect(() => {
        const animationDuration = 500; // 1 second
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
    }, []);

    return (
        <div className={(cn("flex flex-col items-center w-fit mx-auto", className))}>
            <h2 className="text-xl font-bold mb-4">Expenses pie chart</h2>
            <div className="w-full h-96 relative rounded-lg p-4">
                <Surface width={400} height={400} className="mx-auto">
                    {/* Circular grid lines */}
                    <PolarGrid
                        cx={centerX}
                        cy={centerY}
                        innerRadius={20}
                        outerRadius={maxRadius}
                        width={400}
                        height={400}
                        polarAngles={polarAngles}
                        polarRadius={polarRadius}
                        gridType="circle"
                        stroke="#444"
                        strokeWidth={0.5}
                    />

                    {/* Expense segments with hover effects */}
                    {data.map((expense, index) => {
                        const radius = getRadius(expense.total);
                        const isActive = activeIndex === index;

                        return (
                            <Sector
                                key={`sector-${index}`}
                                fill={colorPalette[index % colorPalette.length]}
                                fillOpacity={isActive ? 1 : 0.9}
                                innerRadius={10}
                                outerRadius={isActive ? radius + 5 : radius}
                                cx={centerX}
                                cy={centerY}
                                cornerRadius={10}
                                startAngle={index * angle + startAngleMargin}
                                endAngle={(index + 1) * angle - endAngleMargin}
                                onMouseEnter={() => handleMouseEnter(expense, index)}
                                onMouseLeave={handleMouseLeave}
                                className="cursor-pointer transition-all duration-300"
                            />
                        );
                    })}
                </Surface>

                {/* Custom tooltip */}
                {activeIndex !== null && animationProgress === 1 && (
                    <div
                        className="absolute w-fit h-fit pointer-events-none bg-neutral-600/70 backdrop-blur-sm shadow-md rounded text-primary"
                        style={{
                            left: `${getTooltipPosition(activeIndex).x}px`,
                            top: `${getTooltipPosition(activeIndex).y}px`,
                            transform: "translate(-50%, -50%)",
                            zIndex: 10
                        }}
                    >
                        <div className="bg-transparent px-2 m-2 border-l-4 text-nowrap text-sm" style={{borderColor: colorPalette[activeIndex]}}>
                            <p className="font-bold">{data[activeIndex].category.replace(/_/g, " ")}</p>
                            <p className="">{currencyParser.format(data[activeIndex].total)}</p>
                            <p className="text-xs text-neutral-400">
                                {Math.round((data[activeIndex].total / totalSpending) * 100)}% of total
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 text-lg font-bold">
                Total Spending: {currencyParser.format(totalSpending)}
            </div>
        </div>
    );
}