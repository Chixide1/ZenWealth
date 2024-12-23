import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/components/features/login/LoginForm.tsx'
import logo from "@/assets/ZenWealth.png"

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <main className="h-screen w-full flex flex-col items-center justify-center">
        <div className="flex items-center my-auto sm:mt-0 sm:mb-8">
            <img src={logo} alt="A tree on a coin signifying wealth" className="h-auto w-8 mr-1"/>
            <h1 className="text-primary text-3xl font-semibold montserrat italic">
                Zen
                <span className="text-secondary font">W</span>ealth
            </h1>
        </div>
        <div
            className="text-primary sm:bg-primary/[0.06] rounded-2xl w-full sm:w-[31rem] mb-20 sm:mb-0 sm:py-8 flex flex-col items-center">
            <h2 className="text-5xl sm:text-3xl font-semibold mb-2">Login</h2>
        <p className="text-neutral-400 text-sm mb-11 sm:mb-6">
          Welcome back, please login
        </p>
        <LoginForm />
      </div>
      <p className="sm:mt-8 text-sm text-primary mt-auto mb-14 sm:mb-0">
        Don't have an account?{' '}
        <a href="#" className="text-secondary">
          Sign up
        </a>
      </p>
    </main>
  )
}
