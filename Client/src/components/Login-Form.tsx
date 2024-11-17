import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Loader2 } from 'lucide-react'
import axios from "axios"
import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import {useToast} from "@/hooks/use-toast.ts";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password cannot be empty"),
    rememberMe: z.boolean().default(false)
})

type FormSchemaVals = z.infer<typeof formSchema>

export function LoginForm() {
    const { toast } = useToast()
    const navigate = useNavigate()
    const {
        control,
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormSchemaVals>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false
        }
    })

    async function onSubmit(values: FormSchemaVals) {
        try {
            const backend = import.meta.env.VITE_ASPNETCORE_URLS
            if (values.rememberMe) {
                localStorage.setItem("email", values.email)
                localStorage.setItem("password", values.password)
            }

            const response = await axios({
                method: 'post',
                url: `${backend}/Identity/login`,
                params: {
                    useCookies: true,
                    useSessionCookies: false
                },
                data: {
                    email: values.email,
                    password: values.password
                },
                withCredentials: true,
            })

            if (response.status === 200) {
                console.debug("%cSuccessfully logged in", "color: #bada55")
                navigate({ to: "/dashboard" })
            }
        } catch (error) {
            console.error("Login error:", error)
            toast({
                title: "Login Error",
                description: "Failed to log in. Please check your credentials and try again.",
                variant: "destructive"
            })
        }
    }

    useEffect(() => {
        const storedEmail = localStorage.getItem("email") || ""
        const storedPass = localStorage.getItem("password") || ""

        setValue("email", storedEmail)
        setValue("password", storedPass)
        setValue("rememberMe", !!storedEmail && !!storedPass)
    }, [setValue])

    useEffect(() => {
        if (errors) {
            Object.keys(errors).forEach((key) => {
                const field = errors[key as keyof typeof errors]
                
                toast({
                    title: "Login Error",
                    description: field?.message,
                    variant: "destructive"
                })  
            })
        }
    }, [errors])

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center w-9/12 text-sm">
            <div className="overflow-hidden rounded-md w-full text-secondary">
                <div className="relative">
                    <Label
                        htmlFor="loginEmail"
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-neutral-100/[0.07] rounded-full"
                    >
                        <Mail className="h-4 w-4"/>
                    </Label>
                    <Label htmlFor="loginEmail" className="absolute left-14 top-2 text-xs text-neutral-500">
                        Email
                    </Label>
                    <Input
                        className="pl-14 pb-5 bg-neutral-300/[0.07] border-0 placeholder:text-transparent rounded-none border-b-0 pt-9"
                        placeholder="Email"
                        type="email"
                        id="loginEmail"
                        {...register("email")}
                    />
                </div>
                <div className="relative">
                    <Label
                        htmlFor="loginPass"
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-neutral-100/[0.07] rounded-full"
                    >
                        <Lock className="h-4 w-4"/>
                    </Label>
                    <Label htmlFor="loginPass" className="absolute left-14 top-2 text-xs text-neutral-500">
                        Password
                    </Label>
                    <Input
                        className="pl-14 pb-5 bg-neutral-300/[0.07] placeholder:text-transparent rounded-none pt-9 border-0 border-t border-neutral-700 focus-visible:ring-0"
                        placeholder="Password"
                        type="password"
                        id="loginPass"
                        {...register("password")}
                    />
                </div>
            </div>
            <div className="flex items-center justify-between w-full mt-3">
                <div className="flex items-center space-x-2">
                    <Controller
                        name="rememberMe"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="rememberMe"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label
                        htmlFor="rememberMe"
                        className="font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Remember Me
                    </Label>
                </div>
                <a href="#" className="text-accent font-normal">Forgot Password?</a>
            </div>
            <Button
                type="submit"
                variant="accent"
                disabled={isSubmitting}
                className="mt-6 font-medium w-full flex items-center justify-center"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mt-0.5 animate-spin" />
                        Logging in...
                    </>
                ) : (
                    "Continue"
                )}
            </Button>
            <Toaster />
        </form>
    )
}