import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Institution } from "@/types";

type GetLinkTokenResponse = {
    value: string;
};

// ReauthenticateButton component
export function ReauthenticateButton({ bank, onSuccess }: { bank: Institution, onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [linkToken, setLinkToken] = useState("");
    const queryClient = useQueryClient();

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: (public_token, metadata) => {
            toast({
                title: "Success",
                description: "Bank connection updated successfully"
            });
            queryClient.refetchQueries();
            if (onSuccess) onSuccess();
            setLinkToken(""); // Reset token after success
        },
        onExit: (err, metadata) => {
            if (err) {
                toast({
                    title: "Error",
                    description: "There was an issue updating your bank connection",
                    variant: "destructive"
                });
            }
            setLinkToken("");
        }
    });

    // Effect to open Plaid when token is set and link is ready
    useEffect(() => {
        if (linkToken && ready) {
            console.log("Opening Plaid Link with token:", linkToken);
            open();
        }
    }, [linkToken, ready, open]);

    const handleReauthenticate = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<GetLinkTokenResponse>(`/Link/update/${bank.id}`);
            if (response.status === 200) {
                console.log("Link token received:", response.data.value);
                setLinkToken(response.data.value);
                // The useEffect will handle opening once token is set and ready is true
            } else {
                toast({
                    title: "Error",
                    description: "Failed to generate update link",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Unable to initiate reauthentication",
                variant: "destructive"
            });
            console.error("Reauthentication error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 text-amber-500 hover:text-amber-400 hover:bg-amber-950/30 border-amber-800"
            onClick={handleReauthenticate}
            disabled={isLoading}
        >
            {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
            )}
            <span className="hidden sm:inline">Reauthenticate</span>
        </Button>
    );
}