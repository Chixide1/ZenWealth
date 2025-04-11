import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Key, Lock, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { IdentityInput, IdentityInputConfig } from "@/components/features/identity/IdentityInput";
import { camelCaseToSentence } from "@/lib/utils";
import api from "@/lib/api";
import { LoginLink } from "@/components/shared/LoginLink";

export const Route = createFileRoute("/resetPassword")({
    component: RouteComponent,
    validateSearch: (search) => resetPasswordSchema.parse(search),
});

// Schema for URL parameters
const resetPasswordSchema = z.object({
    email: z.string().email().catch(""),
    token: z.string().catch(""),
});

// Schema for form validation
const formSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type FormSchemaVals = z.infer<typeof formSchema>;

function RouteComponent() {
    const search = Route.useSearch();
    const { toast } = useToast();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [missingParams, setMissingParams] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormSchemaVals>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (!search.email || !search.token) {
            setMissingParams(true);
            toast({
                title: "Invalid Reset Link",
                description: "The password reset link is invalid or expired.",
                variant: "destructive",
            });
        }
    }, [search.email, search.token, toast]);

    useEffect(() => {
        if (errors) {
            Object.keys(errors).forEach((key) => {
                const field = errors[key as keyof typeof errors];
                toast({
                    title: camelCaseToSentence(key),
                    description: field?.message,
                    variant: "destructive",
                });
            });
        }
    }, [errors, toast]);

    const inputs: IdentityInputConfig[] = [
        {
            id: "resetPasswordNew",
            type: "password",
            register: { ...register("newPassword") },
            icon: Key,
            label: "New Password",
            autocomplete: "new-password",
        },
        {
            id: "resetPasswordConfirm",
            type: "password",
            register: { ...register("confirmPassword") },
            icon: Lock,
            label: "Confirm Password",
            autocomplete: "new-password",
        },
    ];

    async function onSubmit(values: FormSchemaVals) {
        try {
            const response = await api.post("/Auth/ResetPassword", {
                email: search.email,
                token: search.token,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
            });

            if (response.status === 200) {
                setIsSubmitted(true);
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            toast({
                title: "Reset Failed",
                description: "Unable to reset password. The link may be expired or invalid.",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen w-full p-4">
            <div className="bg-background p-6 rounded-2xl border border-neutral-500 w-full max-w-md">
                {isSubmitted ? (
                    <div className="text-center space-y-3">
                        <div className="flex gap-2 items-center justify-center text-secondary">
                            <CheckCircle className="w-10 h-auto" />
                            <h1 className="text-3xl font-medium">Password Reset</h1>
                        </div>
                        <p className="text-lg">
                            Your password has been reset successfully.
                        </p>
                        <div className="pt-3">
                            <Link to="/login" preload={false} className="inline-block px-6 py-2 bg-secondary text-black rounded-md hover:bg-secondary/80">
                                Go to Login
                            </Link>
                        </div>
                    </div>
                ) : missingParams ? (
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-medium text-red-500">Invalid Reset Link</h1>
                        <p className="text-lg">
                            The password reset link is invalid or expired. Please request a new password reset.
                        </p>
                        <div className="pt-3">
                            <Link to="/forgotPassword" preload={false} className="inline-block px-6 py-2 bg-secondary text-black rounded-md hover:bg-secondary/80">
                                Request New Reset Link
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-3xl font-medium">Reset Password</h1>
                            <p className="text-neutral-400 mt-2">
                                Create a new password for your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center w-full text-sm">
                            <fieldset className="overflow-hidden rounded-md w-full text-primary">
                                {inputs.map((input) => (
                                    <IdentityInput {...input} key={input.id} />
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
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
            <LoginLink className="mt-6 text-base" />
        </div>
    );
}