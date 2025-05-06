import logo from "@/assets/images/ZenWealth.png";
import {cn} from "@/lib/utils.ts";

type LogoProps = {
    className?: string,
    iconProps?:  React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
    textProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>,
}

export default function Logo({ className, iconProps, textProps }: LogoProps) {
    return (
        <div className={cn("flex items-center", className)}>
            <img
                src={logo}
                alt="A tree on a coin signifying wealth"
                className={cn("h-auto w-8", iconProps?.className ?? "")}
                {...iconProps}
            />
            <h2
                className={cn("text-primary text-sm", textProps?.className ?? "")}
                {...textProps}
            >
                en
                <span className="text-secondary">W</span>ealth
            </h2>
        </div>
    );
}