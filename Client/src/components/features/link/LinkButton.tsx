import { useState, useEffect, useCallback, Fragment } from "react";
import { type PlaidLinkError, type PlaidLinkOnExit, usePlaidLink } from "react-plaid-link";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import Loading from "@/components/shared/Loading.tsx";
import { useQueryClient } from "@tanstack/react-query";

type LinkButtonProps = ButtonProps & {
    className?: string
    children: React.ReactNode,
    reload?: boolean
}

export function LinkButton({ children, className, reload = false, ...props }: LinkButtonProps) {
    const queryClient = useQueryClient();
    const [linkToken, setLinkToken] = useState<string>("");

    const GetLinkToken = useCallback(async () => {
        try {
            const response = await api("/link");
            setLinkToken(response.data.value);
        } catch (error) {
            console.error(error);
        }
    }, []);
    
    useEffect(() => {
        GetLinkToken();
    }, []);

    const { open } = usePlaidLink({
        token: linkToken,
        onSuccess: async (publicToken: string, metadata) => {
            setLinkToken("");
            await api.post("/Link", { publicToken: publicToken, institutionName: metadata.institution?.name });
            await queryClient.refetchQueries();
            
            if(reload){
                location.reload();
            }
            
            GetLinkToken();
        },
        onExit: useCallback<PlaidLinkOnExit>(async (error: PlaidLinkError | null) => {
            if(error){
                console.error(error);
            }
        }, []),
    });
    
    return (
        <Button
            onClick={() => open()}
            className={cn("rounded-full flex items-center justify-center", className)}
            variant={"secondary"}
            disabled={!linkToken}
            {...props}
        >
            {!linkToken ?
                <Fragment>
                    <Loading className="text-black" fullScreen={false} />
                    <span className="hidden md:inline mr-0.5">Fetching</span>
                </Fragment> :
                children}
        </Button>
    );
}

