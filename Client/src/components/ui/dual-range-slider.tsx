﻿"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface DualRangeSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
    labelPosition?: "top" | "bottom";
    label?: (value: number | undefined) => React.ReactNode;
    currencySymbol?: string;
}

const DualRangeSlider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    DualRangeSliderProps
>(({ className, label, labelPosition = "top", currencySymbol, ...props }, ref) => {
    const initialValue = Array.isArray(props.value) ? props.value : [props.min, props.max];

    const formatValueWithCurrency = (value: number | undefined) => {
        if (value === undefined) return "";
        const absValue = Math.abs(value);
        return value < 0
            ? `-${currencySymbol}${absValue}`
            : `${currencySymbol}${value}`;
    };

    return (
        <SliderPrimitive.Root
            ref={ref}
            className={cn("relative flex w-full touch-none select-none items-center", className)}
            {...props}
        >
            <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-neutral-400/80">
                <SliderPrimitive.Range className="absolute h-full bg-secondary" />
            </SliderPrimitive.Track>
            {initialValue.map((value, index) => (
                <React.Fragment key={index}>
                    <SliderPrimitive.Thumb className="relative block h-4 w-4 rounded-full border-0 bg-secondary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50">
                        {label && (
                            <span
                                className={cn(
                                    "absolute text-primary flex w-full justify-center whitespace-nowrap",
                                    labelPosition === "top" && "-top-7",
                                    labelPosition === "bottom" && "top-4",
                                )}
                            >
                                {formatValueWithCurrency(value)}
                            </span>
                        )}
                    </SliderPrimitive.Thumb>
                </React.Fragment>
            ))}
        </SliderPrimitive.Root>
    );
});
DualRangeSlider.displayName = "DualRangeSlider";

export { DualRangeSlider };

