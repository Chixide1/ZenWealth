import * as React from "react";
import { createLink, LinkComponent } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {ArrowUpRight } from "lucide-react";

type BasicLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    // Add any additional props you want to pass to the anchor element
}

const BasicLinkComponent = React.forwardRef<HTMLAnchorElement, BasicLinkProps>(
    (props, ref) => {
        return (
            <a 
                ref={ref} {...props}
                className={cn("w-fit text-black bg-secondary hover:bg-secondary/80 transition-colors duration-500 p-2 rounded-lg !mt-0", props.className)}
            >
                <ArrowUpRight className="h-auto w-4"/>
            </a>
        );
    },
);

const BasicLink = createLink(BasicLinkComponent);

export const ArrowLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
    return <BasicLink preload={"intent"} {...props} />;
};
