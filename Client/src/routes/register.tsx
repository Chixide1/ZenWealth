import { createFileRoute, Link } from "@tanstack/react-router";
import { RegisterForm } from "@/components/features/identity/RegisterForm.tsx";
import Logo from "@/components/shared/Logo.tsx";

export const Route = createFileRoute("/register")({
    component: RegisterPage,
});

function RegisterPage() {
    return (
        <main className="h-screen w-full flex flex-col items-center justify-center">
            <div className="flex items-center my-auto sm:mt-0 sm:mb-8">
                <Logo className="mr-1"/>
            </div>
            <div
                className="text-primary sm:bg-primary/[0.125] rounded-2xl w-full sm:w-[31rem] mb-20 sm:mb-0 sm:py-8 flex flex-col items-center">
                <h2 className="text-5xl sm:text-3xl font-semibold mb-2">Register</h2>
                <p className="text-neutral-400 text-sm mb-11 sm:mb-6">
                    Please Register Your Account
                </p>
                <RegisterForm />
            </div>
            <p className="sm:mt-8 text-sm text-primary mt-auto mb-14 sm:mb-0">
                Have an account?
                <Link to={"/login"} className="text-secondary ms-1">
                    Login
                </Link>
            </p>
        </main>
    );
}
