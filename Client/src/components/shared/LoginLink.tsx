import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export function LoginLink({ className }: { className?: string }) {
    return (
            <p className={cn("text-sm text-primary", className)}>
                Have an account?
                <Link to={"/login"} preload={false} className="text-secondary ms-1 hover:underline">
                    Login
                </Link>
            </p>
    );
}