import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Key, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast.ts";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Button } from "@/components/ui/button.tsx";
import { IdentityInput, IdentityInputConfig } from "@/components/features/identity/IdentityInput.tsx";
import { camelCaseToSentence } from "@/lib/utils.ts";
import api from "@/lib/api.ts";

const formSchema = z.object({
    code: z.string().min(6, "Code must be at least 6 characters").max(7, "Code cannot be more than 7 characters"),
    rememberMe: z.boolean().default(false),
    rememberMachine: z.boolean().default(false)
});

type FormSchemaVals = z.infer<typeof formSchema>

interface MFAVerificationFormProps {
  onCancel: () => void;
  rememberMe: boolean;
}

export function MFAVerificationForm({ onCancel, rememberMe }: MFAVerificationFormProps) {
    const { toast } = useToast();
    const navigate = useNavigate();
    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormSchemaVals>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            rememberMe: rememberMe,
            rememberMachine: false
        }
    });

    async function onSubmit(values: FormSchemaVals) {
        await api.post(
            "/Auth/LoginWithMfa",
            {
                code: values.code.replace(" ", "").replace("-", ""),
                rememberMe: values.rememberMe,
                rememberMachine: values.rememberMachine,
            }
        )
            .then(response => {
                if (response.status === 200) {
                    console.debug("%cSuccessfully verified MFA", "color: #bada55");
                    navigate({ to: "/" });
                }
            })
            .catch(error => {
                console.error("MFA verification error:", error);
                toast({
                    title: "Verification Error",
                    description: error.response?.data?.message || "Failed to verify code. Please try again.",
                    variant: "destructive"
                });
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
            id: "mfaVerificationCode",
            type: "text",
            register: {...register("code")},
            icon: Key,
            label: "Verification Code",
            placeholder: "Enter your 6-digit code"
        }
    ];

    return (
        <>
            <h1 className="text-xl font-semibold mb-4 text-center">Two-Factor Authentication</h1>
            <p className="text-neutral-400 text-sm mb-6 text-center">
        Please enter the verification code from your authenticator app
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center px-9 w-full sm:w-9/12 text-sm">
                <fieldset className="overflow-hidden rounded-md w-full text-primary">
                    {inputs.map((input) => (
                        <IdentityInput {...input} key={input.id}/>
                    ))}
                </fieldset>
                <div className="flex items-center space-x-2 w-full mt-6 sm:mt-3">
                    <Controller
                        name="rememberMachine"
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
                        htmlFor="rememberMachine"
                        className="font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
            Remember this device
                    </Label>
                </div>
                <div className="flex w-full gap-3 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="font-medium w-1/2"
                    >
            Back
                    </Button>
                    <Button
                        type="submit"
                        variant="secondary"
                        disabled={isSubmitting}
                        className="font-medium w-1/2 flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mt-0.5 mr-2 animate-spin" />
                Verifying...
                            </>
                        ) : (
                            "Verify"
                        )}
                    </Button>
                </div>
            </form>
        </>
    );
}