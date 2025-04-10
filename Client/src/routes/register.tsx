import { createFileRoute, Link } from "@tanstack/react-router";
import { RegisterForm } from "@/components/features/identity/RegisterForm.tsx";
import Logo from "@/components/shared/Logo.tsx";

export const Route = createFileRoute("/register")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <main className="h-screen w-full flex flex-col items-center justify-center">
            <div className="flex items-center my-auto">
                <Logo className="mr-1"/>
            </div>
            <div className="text-primary sm:bg-background rounded-2xl w-full sm:w-[31rem] sm:pt-4 sm:pb-6 flex flex-col items-center">
                <h2 className="text-5xl sm:text-3xl font-semibold mb-2">Register</h2>
                <p className="text-neutral-400 text-sm mb-11 sm:mb-6">
                    Please Register Your Account
                </p>
                <RegisterForm />
            </div>
            <p className="text-sm text-primary my-auto">
                Have an account?
                <Link to={"/login"} className="text-secondary ms-1">
                    Login
                </Link>
            </p>
        </main>
    );
}
