import { createFileRoute, Link } from "@tanstack/react-router";
import { RegisterForm } from "@/components/features/identity/RegisterForm.tsx";
import Logo from "@/components/shared/Logo.tsx";
import { LoginLink } from "@/components/shared/LoginLink";

export const Route = createFileRoute("/register")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <main className="h-screen w-full flex flex-col items-center justify-center pb-20">
            <div className="flex items-center mb-6 mt-auto">
                <Logo className="mr-1"/>
            </div>
            <div className="text-primary sm:bg-background rounded-2xl w-full sm:w-[31rem] sm:pt-4 sm:pb-6 flex flex-col items-center">
                <h2 className="text-5xl sm:text-3xl font-semibold mb-2">Register</h2>
                <p className="text-neutral-400 text-sm mb-11 sm:mb-6">
                    Please Register Your Account
                </p>
                <RegisterForm />
            </div>
            <LoginLink className="mt-6 mb-auto" />
        </main>
    );
}
