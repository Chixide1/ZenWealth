import { useState, useEffect, useCallback } from 'react';
import {PlaidLinkError, PlaidLinkOnExit, PlaidLinkOnExitMetadata, usePlaidLink } from 'react-plaid-link';
import axios from 'axios'
import { Button, ButtonProps } from '@/components/core/button';
import {cn} from "@/lib/utils.ts";

type LinkTokenResponse = {
    value: string
}

type LinkButtonProps = ButtonProps & {
    className?: string
    children: React.ReactNode
}

export function LinkButton({children, className, ...props}: LinkButtonProps) {
    const [linkToken, setLinkToken] = useState<string>("")
    const backend = import.meta.env.VITE_ASPNETCORE_URLS + "/Api"

    useEffect(() => {
        async function GetLinkToken(){
            await axios.get<LinkTokenResponse>(
                `${backend}/GetLinkToken`,
                {withCredentials: true}
            )
                .then(response => setLinkToken(response.data.value))
                .catch(error => console.log(error))
        }
        GetLinkToken();
    }, []);

    const { open } = usePlaidLink({
        token: linkToken,
        onSuccess: (publicToken: string) => {
            axios.post(
                `${backend}/ExchangePublicToken`,
                {publicToken: publicToken}, 
                {withCredentials: true}
            )
            location.reload()
        },
        onExit: useCallback<PlaidLinkOnExit>(
            (error: PlaidLinkError | null, metadata: PlaidLinkOnExitMetadata) => {
                console.log(error)
                console.log(metadata)
            },[]
        )
    });

    return(
        <Button
            onClick={() => open()}
            className={cn("w-full", className)}
            variant={"secondary"}
            {...props}
        >
            {children}
        </Button>
    )
}