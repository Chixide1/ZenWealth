import logo from "@/assets/ZenWealth.png";
import {cn} from "@/lib/utils.ts";

type LogoProps = {
    className?: string;
    props?:  React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
}

export default function Logo({ className, props }: LogoProps) {
    return (
        <img
            src={logo}
            alt="A tree on a coin signifying wealth"
            className={cn("h-auto w-8", className)}
            {...props}
        />
    )
}