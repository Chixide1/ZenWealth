import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const tabsListRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const updateIndicator = () => {
            if (tabsListRef.current) {
                const activeTab = tabsListRef.current.querySelector<HTMLElement>(
                    '[data-state="active"]'
                );

                if (activeTab) {
                    const activeRect = activeTab.getBoundingClientRect();
                    const tabsRect = tabsListRef.current.getBoundingClientRect();
                    setIndicatorStyle({
                        left: activeRect.left - tabsRect.left,
                        width: activeRect.width,
                    });
                }
            }
        };

        updateIndicator();
        window.addEventListener("resize", updateIndicator);
        const observer = new MutationObserver(updateIndicator);
        if (tabsListRef.current) {
            observer.observe(tabsListRef.current, {
                attributes: true,
                childList: true,
                subtree: true,
            });
        }
        return () => {
            window.removeEventListener("resize", updateIndicator);
            observer.disconnect();
        };
    }, [props.children]);
    
    return (
        <div className="relative" ref={tabsListRef}>
            <TabsPrimitive.List
                ref={ref}
                className={cn(
                    "inline-flex h-10 bg-transparent items-center justify-center rounded-md p-1 relative",
                    className
                )}
                {...props}
            />
            <div
                className="absolute p-0 top-1 h-8 bg-secondary rounded-full transition-all duration-300 ease-in-out shadow-sm"
                style={indicatorStyle}
            />
        </div>
    );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    return (
        <TabsPrimitive.Trigger
            ref={ref}
            data-state={`${props.value === location.pathname ? "active" : "inactive"}`}
            onClick={() => {
                navigate({
                    to: `${props.value}`
                })
            }}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground z-10",
                className
            )}
            {...props}
        />
    )
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props}
    />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };