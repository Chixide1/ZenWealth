import { useState, useEffect, useCallback } from 'react';
import {PlaidLinkError, PlaidLinkOnExit, PlaidLinkOnExitMetadata, usePlaidLink } from 'react-plaid-link';
import axios from 'axios'
import { Button } from '@/components/core/button';

type LinkTokenResponse = {
    value: string
}

export function LinkButton(){
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
        <Button onClick={() => open()} className={"w-full"} variant={"secondary"}>Connect Your Account</Button>
    )
}