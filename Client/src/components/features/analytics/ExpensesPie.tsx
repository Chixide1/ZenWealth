import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {debitColors} from "@/lib/utils.ts";

const data = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 },
];

export const ExpensesPie = () => {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={debitColors[index % debitColors.length]}
                            // Individual outer radius for each cell
                            outerRadius={index === 1 ? 100 : 80}
                        />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};

// Define the metrics and their data
const metrics = [
    { name: "HAE", value: 65, color: "#f7f0a0" }, // Yellow
    { name: "RMSE", value: 45, color: "#a8e6a8" }, // Light green
    { name: "EM", value: 55, color: "#d9b99b" }, // Light brown
    { name: "LMRE", value: 70, color: "#a8e6a8" }, // Light green
    { name: "GAE", value: 60, color: "#a8e6a8" }, // Light green
    { name: "AEE", value: 50, color: "#a8d8e6" }, // Light blue
]

export default function CustomRadarChart() {
    const width = 500
    const height = 500
    const cx = width / 2
    const cy = height / 2
    const outerRadius = 180

    // Calculate angles for each metric
    const angleStep = (2 * Math.PI) / metrics.length

    // Create concentric circles
    const circles = [0.25, 0.5, 0.75, 1].map((ratio, index) => (
        <circle key={`circle-${index}`} cx={cx} cy={cy} r={outerRadius * ratio} fill="none" stroke="#ccc" strokeWidth={1} />
    ))

    // Create colored sectors
    const sectors = metrics.map((metric, index) => {
        const startAngle = index * angleStep - angleStep / 2
        const endAngle = startAngle + angleStep

        // Calculate points for the sector path
        const radius = outerRadius * (metric.value / 100)

        // Create SVG arc path
        const x1 = cx + radius * Math.sin(startAngle)
        const y1 = cy - radius * Math.cos(startAngle)
        const x2 = cx + radius * Math.sin(endAngle)
        const y2 = cy - radius * Math.cos(endAngle)

        const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1

        const pathData = [
            `M ${cx},${cy}`,
            `L ${x1},${y1}`,
            `A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`,
            "Z",
        ].join(" ")

        return <path key={`sector-${index}`} d={pathData} fill={metric.color} fillOpacity={0.5} stroke="none" />
    })

    // Create axis lines
    const axisLines = metrics.map((_, index) => {
        const angle = index * angleStep
        const x = cx + outerRadius * Math.sin(angle)
        const y = cy - outerRadius * Math.cos(angle)

        return <line key={`axis-${index}`} x1={cx} y1={cy} x2={x} y2={y} stroke="#ccc" strokeWidth={1} />
    })

    // Create labels
    const labels = metrics.map((metric, index) => {
        const angle = index * angleStep
        const labelRadius = outerRadius + 20
        const x = cx + labelRadius * Math.sin(angle)
        const y = cy - labelRadius * Math.cos(angle)

        return (
            <text
                key={`label-${index}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontWeight="bold"
                fontSize={14}
            >
                {metric.name}
            </text>
        )
    })

    // Create angle indicator (red line)
    const indicatorAngle = Math.PI / 6 // 30 degrees
    const indicatorX = cx + 100 * Math.sin(indicatorAngle)
    const indicatorY = cy - 100 * Math.cos(indicatorAngle)

    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-xl aspect-square border border-gray-200 rounded-lg p-4">
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                    {/* Outer circle */}
                    <circle cx={cx} cy={cy} r={outerRadius} fill="none" stroke="#000" strokeWidth={2} />

                    {/* Concentric circles */}
                    {circles}

                    {/* Axis lines */}
                    {axisLines}

                    {/* Colored sectors - render these AFTER the grid but BEFORE other elements */}
                    {sectors}

                    {/* Angle indicator (red line) */}
                    <line x1={cx} y1={cy} x2={indicatorX} y2={indicatorY} stroke="red" strokeWidth={2} />

                    {/* Mathematical notation */}
                    <text x={cx - 10} y={cy - 20} textAnchor="middle" fill="#000" fontSize={12}>
                        I
                        <tspan dy={4} fontSize={10}>
                            ij
                        </tspan>
                    </text>
                    <text x={cx} y={cy} textAnchor="middle" fill="#000" fontSize={12}>
                        S
                        <tspan dy={4} fontSize={10}>
                            ij
                        </tspan>
                    </text>
                    <text x={cx - 25} y={cy + 15} textAnchor="middle" fill="#000" fontSize={12}>
                        v
                        <tspan dy={4} fontSize={10}>
                            ij
                        </tspan>
                    </text>
                    <text x={cx + 25} y={cy + 15} textAnchor="middle" fill="#000" fontSize={12}>
                        v
                        <tspan dy={4} fontSize={10}>
                            i(j+1)
                        </tspan>
                    </text>
                    <text x={cx} y={cy + 30} textAnchor="middle" fill="#000" fontSize={12}>
                        α
                        <tspan dy={4} fontSize={10}>
                            i
                        </tspan>
                    </text>

                    {/* Labels */}
                    {labels}
                </svg>
            </div>
        </div>
    )
}

