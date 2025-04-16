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
export function ReauthenticateButton({ bank }: { bank: Institution }) {
    const [linkToken, setLinkToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const getUpdateLinkToken = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<GetLinkTokenResponse>(`/Link/${bank.id}`);
            setLinkToken(response.data.value);
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

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: async (public_token) => {
            try {
                // Exchange the public token for a new access token and update the item
                await api.put(`/Link/${bank.id}`, { publicToken: public_token });

                toast({
                    title: "Success",
                    description: "Bank connection updated successfully"
                });

                // Refresh data after successful reauthentication
                queryClient.invalidateQueries();
            } catch (error) {
                console.error("Error updating bank connection:", error);
                toast({
                    title: "Error",
                    description: "Failed to update bank connection",
                    variant: "destructive"
                });
            } finally {
                // Reset the link token
                setLinkToken("");
            }
        },
        onExit: (err) => {
            setLinkToken("");
            if (err) {
                toast({
                    title: "Error",
                    description: "There was an issue updating your bank connection",
                    variant: "destructive"
                });
            }
            getUpdateLinkToken();
        }
    });

    // Effect to supply update token on mount
    useEffect(() => {
        getUpdateLinkToken();
    }, []);

    // Determine if the button should be in loading state
    const buttonLoading = isLoading || (!ready && linkToken !== "");

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 text-amber-500 hover:text-amber-400 hover:bg-amber-950/30 border-amber-800"
            onClick={() => {
                if (ready && linkToken) {
                    open();
                }
            }}
            isLoading={buttonLoading}
            loadingText="Loading..."
        >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Reauthenticate</span>
        </Button>
    );
}