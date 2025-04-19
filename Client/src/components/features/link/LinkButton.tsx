import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import { useQueryClient } from "@tanstack/react-query";
import {toast} from "@/hooks/use-toast.ts";
import {AxiosError} from "axios";

type LinkButtonProps = ButtonProps & {
    className?: string
    children: React.ReactNode,
    reload?: boolean
}

export function LinkButton({ children, className, reload = false, ...props }: LinkButtonProps) {
    const [linkToken, setLinkToken] = useState("");
    const queryClient = useQueryClient();

    const GetLinkToken = async () => {
        await api<{value: string}>("/link")
            .then(response => setLinkToken(response.data.value))
            .catch((error: AxiosError) => {
                toast({
                    title: "Error",
                    description: "Unable to open the Plaid Link, please refresh then try again",
                    variant: "destructive"
                });
                console.error(error);
            });
    };

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: async (publicToken, metadata) => {
            setLinkToken("");
            
            await api.post("/Link", {
                publicToken: publicToken,
                institutionName: metadata.institution?.name ?? "",
                institutionId: metadata.institution?.institution_id ?? "",
            }).then(() => {
                queryClient.invalidateQueries();

                if(reload){
                    location.reload();
                }

                toast({
                    title: "Success",
                    description: "Bank connection added successfully"
                });
            }).catch((error: AxiosError) => {
                if (error.response?.status === 409) {
                    toast({
                        title: "Duplicate Connection",
                        description: "This institution is already connected to your account",
                        variant: "destructive"
                    });
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to add bank connection",
                        variant: "destructive"
                    });
                }
            }).finally(() => GetLinkToken());
        },
        onExit: (error) => {
            setLinkToken("");
            if (error) {
                toast({
                    title: "Error",
                    description: "There was an issue updating your bank connection",
                    variant: "destructive"
                });
                console.error(error);
            }
            GetLinkToken();
        },
        oauthRedirectUri: window.location.href,
    });

    useEffect(() => {
        GetLinkToken();
    }, []);

    return (
        <Button
            onClick={() => open()}
            className={cn("rounded-full flex items-center justify-center", className)}
            variant={"secondary"}
            isLoading={!ready || !linkToken}
            loadingText="Fetching..."
            {...props}
        >
            {children}
        </Button>
    );
}