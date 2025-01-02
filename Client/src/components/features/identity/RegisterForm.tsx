import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Mail, Lock, Loader2} from 'lucide-react'
import axios, { AxiosError } from "axios"
import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import {useToast} from "@/hooks/use-toast.ts";
import {Button} from "@/components/core/button.tsx";
import {Toaster} from "@/components/core/toaster.tsx";
import {IdentityInput, IdentityInputConfig} from "@/components/features/identity/IdentityInput.tsx";
import {camelCaseToSentence} from "@/lib/utils.ts";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password cannot be empty"),
    confirmPassword: z.string().min(1, "Password cannot be empty"),
})

type FormSchemaVals = z.infer<typeof formSchema>
type RegisterApiResponse = {
    "type": "string",
    "title": "string",
    "status": 0,
    "detail": "string",
    "instance": "string",
    "errors": Record<string, string[]>
}

export function RegisterForm(){
    const { toast } = useToast()
    const navigate = useNavigate()
    const {
        register,
        setError,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormSchemaVals>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        }
    })

    async function onSubmit(values: FormSchemaVals) {
        const backend = import.meta.env.VITE_ASPNETCORE_URLS
        
        if(values.password !== values.confirmPassword){
            setError("root", {
                message: "Passwords do not match",
            });
            return;
        }
        
        await axios({
            method: 'post',
            url: `${backend}/Identity/register`,
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
            .then(() => {
                navigate({ to: "/login" })
            })
            .catch((error: AxiosError<RegisterApiResponse>) => {
                if(error.status === 400 && error.response){
                    const apiErrors = error.response.data.errors
                    
                    Object.entries(apiErrors).forEach((key) => {
                            toast({
                                title: key[0],
                                description: key[1][0],
                                variant: "destructive",
                            })
                    })
                }
            })
    }

    useEffect(() => {
        if (errors) {
            Object.keys(errors).forEach((key) => {
                const field = errors[key as keyof typeof errors]
                toast({
                    title: camelCaseToSentence(key),
                    description: field?.message,
                    variant: "destructive"
                })
            })
        }
    }, [errors])

    const inputs: IdentityInputConfig[] = [
        {
            id: "registerFormEmail",
            type: "email",
            register: {...register("email")},
            icon: Mail,
            label: "Email",
        },
        {
            id: "registerFormPassword",
            type: "password",
            register: {...register("password")},
            icon: Lock,
            label: "Password",
        },
        {
            id: "registerFormConfirmPassword",
            type: "password",
            register: {...register("confirmPassword")},
            icon: Lock,
            label: "Confirm Password",
        }
    ]
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center px-9 w-full sm:w-9/12 text-sm">
            <div className="overflow-hidden rounded-md w-full text-primary">
                {inputs.map((input) => (
                    <IdentityInput {...input} key={input.id}/>
                ))}
            </div>
            <Button
                type="submit"
                variant="secondary"
                disabled={isSubmitting}
                className="mt-6 font-medium w-full flex items-center justify-center"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mt-0.5 animate-spin"/>
                        Registering...
                    </>
                ) : (
                    "Register"
                )}
            </Button>
            <Toaster/>
        </form>
    )
}