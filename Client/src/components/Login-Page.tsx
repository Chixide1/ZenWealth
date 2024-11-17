﻿import {LoginForm} from "@/components/Login-Form.tsx";

export function LoginPage() {

    return (
        <main className="h-screen w-full flex flex-col items-center justify-center">
            <h1 className="text-secondary text-3xl font-semibold mb-8 montserrat italic">Zen<span className="text-accent font">W</span>ealth</h1>
            <div className="text-secondary bg-neutral-500/[0.06] rounded-2xl w-[31rem] p-8 flex flex-col items-center">
                <h2 className="text-3xl font-semibold mb-2">Login</h2>
                <p className="text-neutral-400 text-sm mb-6">Welcome back, please login</p>
                <LoginForm/>
                <p className="mt-8 text-sm">Don't have an account? <a href="#" className="text-accent">Sign up</a></p>
            </div>
        </main>
    );
}