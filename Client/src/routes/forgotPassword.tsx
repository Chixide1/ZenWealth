import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { IdentityInput, IdentityInputConfig } from "@/components/features/identity/IdentityInput";
import { camelCaseToSentence } from "@/lib/utils";
import api from "@/lib/api";
import { LoginLink } from "@/components/shared/LoginLink";

export const Route = createFileRoute("/forgotPassword")({
    component: RouteComponent,
});

const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type FormSchemaVals = z.infer<typeof formSchema>;

function RouteComponent() {
    const { toast } = useToast();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormSchemaVals>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

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
            id: "forgotPasswordEmail",
            type: "email",
            register: { ...register("email") },
            icon: Mail,
            label: "Email",
            autocomplete: "email",
        },
    ];

    async function onSubmit(values: FormSchemaVals) {
        try {
            const response = await api.post("/Auth/ForgotPassword", {
                email: values.email,
            });

            if (response.status === 200) {
                setSubmittedEmail(values.email);
                setIsSubmitted(true);
            }
        } catch (error) {
            console.error("Error sending reset email:", error);
            toast({
                title: "Request Failed",
                description: "Unable to send password reset email. Please try again later.",
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
                            <MailCheck className="w-10 h-auto" />
                            <h1 className="text-3xl font-medium">Email Sent!</h1>
                        </div>
                        <p className="text-lg">
                            If an account exists with the email <span className="font-medium">{submittedEmail}</span>,
                            you'll receive password reset instructions shortly.
                        </p>
                        <div className="pt-3">
                            <Link to="/login" preload={false} className="inline-block px-6 py-2 bg-secondary text-black rounded-md hover:bg-secondary/80">
                                Return to Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-3xl font-medium">Reset Password</h1>
                            <p className="text-neutral-400 mt-2">
                                Enter your email address and we'll send you instructions to reset your password.
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
                                className="mt-6 w-full  font-medium flex items-center justify-center"
                                isLoading={isSubmitting}
                                loadingText="Sending..."
                            >
                                Send Reset Link
                            </Button>
                        </form>
                    </div>
                )}
            </div>
            <LoginLink className="mt-6 text-base" />
        </div>
    );
}