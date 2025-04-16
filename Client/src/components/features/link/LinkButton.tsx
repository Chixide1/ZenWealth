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
        try {
            const response = await api<{value: string}>("/link");
            setLinkToken(response.data.value);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to obtain link token",
                variant: "destructive"
            });
            console.error(error);
        }
    };

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: async (publicToken, metadata) => {
            try {
                setLinkToken("");
                await api.post("/Link", {
                    publicToken: publicToken,
                    institutionName: metadata.institution?.name,
                    institutionId: metadata.institution?.institution_id
                });

                queryClient.invalidateQueries();

                if(reload){
                    location.reload();
                }

                toast({
                    title: "Success",
                    description: "Bank connection added successfully"
                });
                GetLinkToken();
            } catch (error: AxiosError) {
                // Handle duplicate institution error
                if (error.response?.status === 409) {
                    toast({
                        title: "Duplicate Connection",
                        description: error.response.data.Error ?? "This institution is already connected to your account",
                        variant: "destructive"
                    });
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to add bank connection",
                        variant: "destructive"
                    });
                }
                console.error(error);
                GetLinkToken();
            }
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