import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useState, useEffect } from "react";
import api from "@/lib/api.ts";
import {AlertTriangle, MailCheck, X } from "lucide-react";
import {AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import Loading from "@/components/shared/Loading.tsx";
import { LoginLink } from "@/components/shared/LoginLink";

export const Route = createFileRoute("/confirmEmail")({
    component: RouteComponent,
    validateSearch: (search) => confirmAccountSchema.parse(search),
});

const confirmAccountSchema = z.object({
    email: z.string().email().catch(""),
    token: z.string().catch(""),
});

type ConfirmAccountSchema = z.infer<typeof confirmAccountSchema>

function RouteComponent() {
    const search = Route.useSearch();
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyEmailToken = async () => {
            try {
                setIsLoading(true);

                // Call your API endpoint to verify the email and token
                const response = await api.post("/Auth/ConfirmEmail", {
                    email: search.email,
                    token: search.token,
                });

                if (response.status !== 200) {
                    throw new Error("Failed to verify email");
                }
                
                setIsVerified(true);
            } catch (err) {
                console.error("Error verifying email:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
                setIsVerified(false);
            } finally {
                setIsLoading(false);
            }
        };

        if (search.email && search.token) {
            verifyEmailToken();
        } else {
            setIsLoading(false);
            setError("Missing email or token");
            setIsVerified(false);
        }
    }, [search.email, search.token]);

    return (
        <div className="flex flex-col items-center justify-center h-screen w-full p-4">
            <div className="bg-background p-6 rounded-2xl border border-neutral-500">
                {isLoading ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-medium mb-4">Verifying your email...</h2>
                        <Loading className="text-secondary" fullScreen={false} />
                    </div>
                ) : isVerified ? (
                    <div className="text-center space-y-3">
                        <div className="flex gap-2 items-center justify-center text-secondary">
                            <MailCheck className="w-10 h-auto" />
                            <h1 className="text-3xl font-medium">Email Verified Successfully!</h1>
                        </div>
                        <p className="text-lg">Your account has been confirmed. You can now log in.</p>
                        <Link to="/login" preload={false} className="inline-block px-6 py-2 bg-secondary text-black rounded-md hover:bg-secondary/80">
                            Go to Login
                        </Link>
                    </div>
                ) : (
                    <div className="text-center text-red-600  rounded-[inherit]">
                        <div className="flex gap-2 items-center justify-center w-full">
                            <AlertTriangle />
                            <AlertTitle className="text-3xl mb-0 font-medium">Verification Failed</AlertTitle>
                        </div>
                        <AlertDescription className="text-lg mt-2">{"Unable to verify your email. The link may be expired or invalid."}</AlertDescription>
                        <div className="mt-4 space-y-3">
                            <Link to="/forgotPassword" className="inline-block px-6 py-2 bg-secondary text-black rounded-md hover:bg-secondary/80">
                                Resend Verification Email
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            <LoginLink className="mt-6 text-base" />
        </div>
    );
}