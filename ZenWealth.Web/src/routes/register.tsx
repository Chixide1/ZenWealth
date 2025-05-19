import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@/components/features/identity/RegisterForm.tsx";
import Logo from "@/components/shared/Logo.tsx";
import { LoginLink } from "@/components/shared/LoginLink";

export const Route = createFileRoute("/register")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <main className="py-10 h-safe-screen w-full flex flex-col items-center justify-center">
            <div className="flex items-center">
                <Logo className="mr-1 mb-2"/>
            </div>
            <div className="mt-auto text-primary sm:bg-background rounded-2xl w-full md:mb-6 sm:w-[31rem] pb-10 sm:pb-6 sm:pt-4 flex flex-col items-center">
                <h2 className="text-5xl sm:text-3xl font-semibold mb-2">Register</h2>
                <p className="text-neutral-400 text-sm mb-6">
                    Please Register Your Account
                </p>
                <RegisterForm />
            </div>
            <LoginLink className="mb-auto" />
        </main>
    );
}
