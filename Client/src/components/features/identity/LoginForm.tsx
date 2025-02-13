import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {useToast} from "@/hooks/use-toast.ts";
import { Label } from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import {IdentityInput, IdentityInputConfig} from "@/components/features/identity/IdentityInput.tsx";
import {camelCaseToSentence} from "@/lib/utils.ts";
import api from "@/lib/api.ts";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password cannot be empty"),
    rememberMe: z.boolean().default(false)
});

type FormSchemaVals = z.infer<typeof formSchema>

export function LoginForm() {
    const { toast } = useToast();
    const navigate = useNavigate();
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
    });

    async function onSubmit(values: FormSchemaVals) {
        if (values.rememberMe) {
            localStorage.setItem("email", values.email);
            localStorage.setItem("password", values.password);
        }

        await api.post(
            "/Identity/login",
            {
                email: values.email,
                password: values.password
            },
            {
                params: {
                    useCookies: true,
                    useSessionCookies: false
                }
            }
        )
            .then(response => {
                if (response.status === 200) {
                    console.debug("%cSuccessfully logged in", "color: #bada55");
                    navigate({ to: "/" });
                }
            })
            .catch(error => {
                console.error("Login error:", error);
                toast({
                    title: "Login Error",
                    description: "Failed to log in. Please check your credentials and try again.",
                    variant: "destructive"
                });
            });
    }

    useEffect(() => {
        const storedEmail = localStorage.getItem("email") || "";
        const storedPass = localStorage.getItem("password") || "";

        setValue("email", storedEmail);
        setValue("password", storedPass);
        setValue("rememberMe", !!storedEmail && !!storedPass);
    }, [setValue]);

    useEffect(() => {
        if (errors) {
            Object.keys(errors).forEach((key) => {
                const field = errors[key as keyof typeof errors];

                toast({
                    title: camelCaseToSentence(key),
                    description: field?.message,
                    variant: "destructive"
                });
            });
        }
    }, [errors]);

    const inputs: IdentityInputConfig[] = [
        {
            id: "loginFormEmail",
            type: "email",
            register: {...register("email")},
            icon: Mail,
            label: "Email",
            autocomplete: "username"
        },
        {
            id: "loginFormPassword",
            type: "password",
            register: {...register("password")},
            icon: Lock,
            label: "Password",
            autocomplete: "current-password"
        },
    ];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center px-9 w-full sm:w-9/12 text-sm">
            <fieldset className="overflow-hidden rounded-md w-full text-primary">
                {inputs.map((input) => (
                    <IdentityInput {...input} key={input.id}/>
                ))}
            </fieldset>
            <div className="flex items-center justify-between w-full mt-6 sm:mt-3">
                <div className="flex items-center space-x-2">
                    <Controller
                        name="rememberMe"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                className={"border-secondary"}
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
                <a href="#" className="text-secondary font-normal">Forgot Password?</a>
            </div>
            <Button
                type="submit"
                variant="secondary"
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
    );
}