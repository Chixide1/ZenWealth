import { createFileRoute, Link } from "@tanstack/react-router";
import { LoginForm } from "@/components/features/identity/LoginForm.tsx";
import Logo from "@/components/shared/Logo.tsx";
import api from "@/lib/api";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
    beforeLoad: checkAuth,
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <main className="h-dvh w-full flex flex-col items-center justify-center">
            <div className="flex items-center my-auto sm:mt-0 sm:mb-8">
                <Logo />
            </div>
            <div
                className="text-primary sm:bg-background rounded-2xl w-full sm:w-[31rem] sm:mb-0 sm:py-8 flex flex-col items-center">
                <h1 className="text-5xl sm:text-3xl font-semibold mb-2">Login</h1>
                <p className="text-neutral-400 text-sm mb-11 sm:mb-6">
          Welcome back, please login
                </p>
                <LoginForm />
            </div>
            <p className="sm:mt-8 text-sm text-primary mt-auto mb-14 sm:mb-0">
        Don't have an account?
                <Link to={"/register"} className="text-secondary ms-1">
              Register
                </Link>
            </p>
        </main>
    );
}

async function checkAuth(){
    try {
        await api.get("/User");
        // If we get here without a 401 error, user is authenticated
        // Redirect them away from login page
        throw redirect({ to: "/" });
    } catch {
        // If we got a 401, do nothing (stay on login page)
        // This prevents the redirect in the interceptor from firing
        return;
    }
}