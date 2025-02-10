import { createFileRoute, Link } from "@tanstack/react-router";
import { LoginForm } from "@/components/features/identity/LoginForm.tsx";
import Logo from "@/components/shared/Logo.tsx";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="h-screen w-full flex flex-col items-center justify-center">
        <div className="flex items-center my-auto sm:mt-0 sm:mb-8">
            <Logo />
        </div>
        <div
            className="text-primary sm:bg-primary/[0.125] rounded-2xl w-full sm:w-[31rem] mb-20 sm:mb-0 sm:py-8 flex flex-col items-center">
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
