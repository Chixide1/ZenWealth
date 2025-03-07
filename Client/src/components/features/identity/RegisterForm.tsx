import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Lock, Loader2, UserRound} from "lucide-react";
import { AxiosError } from "axios";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {useToast} from "@/hooks/use-toast.ts";
import {Button} from "@/components/ui/button.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import {IdentityInput, IdentityInputConfig} from "@/components/features/identity/IdentityInput.tsx";
import {camelCaseToSentence} from "@/lib/utils.ts";
import api from "@/lib/api.ts";

const formSchema = z.object({
    email: z.string().email(),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password cannot be empty"),
    confirmPassword: z.string().min(1, "Password cannot be empty"),
}).superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "The passwords provided did not match!",
            path: ["confirmPassword"]
        });
    }
});

type FormSchemaVals = z.infer<typeof formSchema>
type RegisterApiResponse = {
    "errors": {
            code: string,
            description: string, 
    }[]
}

export function RegisterForm(){
    const { toast } = useToast();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormSchemaVals>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
        }
    });

    async function onSubmit(values: FormSchemaVals) {
        await api.post(
            "/Auth/Register",
            {
                email: values.email,
                username: values.username,
                password: values.password
            }
        )
            .then(() => {
                navigate({ to: "/login" });
            })
            .catch((error: AxiosError<RegisterApiResponse>) => {
                if(error.status === 400 && error.response){
                    const apiErrors = error.response.data.errors;
                    
                    apiErrors.forEach((error) => {
                        toast({
                            title: camelCaseToSentence(error.code),
                            description: error.description,
                            variant: "destructive",
                        });
                    });
                }
            });
    }

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
            id: "registerFormEmail",
            type: "email",
            register: {...register("email")},
            icon: Mail,
            label: "Email",
            autocomplete: "username"
        },
        {
            id: "registerFormUsername",
            type: "username",
            register: {...register("username")},
            icon: UserRound,
            label: "Username",
            autocomplete: "username"
        },
        {
            id: "registerFormPassword",
            type: "password",
            register: {...register("password")},
            icon: Lock,
            label: "Password",
            autocomplete: "new-password"
        },
        {
            id: "registerFormConfirmPassword",
            type: "password",
            register: {...register("confirmPassword")},
            icon: Lock,
            label: "Confirm Password",
            autocomplete: "new-password"
        }
    ];
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center px-9 w-full sm:w-9/12 text-sm">
            <fieldset className="overflow-hidden rounded-md w-full text-primary">
                {inputs.map((input) => (
                    <IdentityInput {...input} key={input.id}/>
                ))}
            </fieldset>
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
    );
}